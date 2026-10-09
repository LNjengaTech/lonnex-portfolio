import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

const SESSION_COOKIE_NAME = "hive_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AdminUserSession {
  id: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Validates and retrieves the current authenticated admin user from session cookie.
 */
export async function getCurrentSession(): Promise<AdminUserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const now = new Date();
    const sessions = await db
      .select({
        sessionId: adminSessions.id,
        userId: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        expiresAt: adminSessions.expiresAt,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
      .where(
        and(eq(adminSessions.id, token), gt(adminSessions.expiresAt, now))
      )
      .limit(1);

    if (!sessions.length) {
      return null;
    }

    const session = sessions[0];
    return {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    };
  } catch (error) {
    console.error("[Auth Error]: Failed to check current session", error);
    return null;
  }
}

/**
 * Enforces admin authentication on the server.
 * Used in server actions and protected layouts.
 */
export async function requireAuth(): Promise<AdminUserSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Generates a cryptographically secure random session token.
 */
function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Authenticates the admin user and issues a secure session cookie.
 */
export async function loginAdmin(
  email: string,
  password: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look up user in database
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, normalizedEmail))
      .limit(1);

    let user = users[0];

    // Fallback bootstrap from environment variables if table is empty
    if (!user) {
      const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const envPassword = process.env.ADMIN_PASSWORD;

      if (envEmail && envPassword && normalizedEmail === envEmail) {
        const hash = await bcrypt.hash(envPassword, 10);
        const [newUser] = await db
          .insert(adminUsers)
          .values({
            email: envEmail,
            passwordHash: hash,
            name: "Lonnex Njenga",
            role: "admin",
          })
          .returning();
        user = newUser;
      }
    }

    if (!user) {
      return { success: false, error: "Invalid email or credentials." };
    }

    // 2. Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      await logAudit({
        userId: user.id,
        action: "auth.login_failed",
        entityType: "admin_user",
        entityId: String(user.id),
        details: { email: normalizedEmail },
        ipAddress,
      });
      return { success: false, error: "Invalid email or credentials." };
    }

    // 3. Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(adminSessions).values({
      id: token,
      userId: user.id,
      expiresAt,
      ipAddress,
    });

    // 4. Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    await logAudit({
      userId: user.id,
      action: "auth.login_success",
      entityType: "admin_user",
      entityId: String(user.id),
      ipAddress,
    });

    return { success: true };
  } catch (error) {
    console.error("[Auth Login Error]", error);
    return { success: false, error: "An unexpected authentication error occurred." };
  }
}

/**
 * Logs out the admin user, clears the session in the database, and removes cookie.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await db.delete(adminSessions).where(eq(adminSessions.id, token));
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    await logAudit({
      action: "auth.logout",
      entityType: "admin_user",
    });
  } catch (error) {
    console.error("[Auth Logout Error]", error);
  }

  redirect("/admin/login");
}
