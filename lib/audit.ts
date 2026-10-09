import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export interface LogAuditParams {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Records an entry in the security and audit log.
 * Safe helper: logs to console if database execution fails.
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    console.error("[Audit Log Error]: Failed to write audit event", {
      params,
      error,
    });
  }
}
