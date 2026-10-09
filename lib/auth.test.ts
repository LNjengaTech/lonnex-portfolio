import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";

describe("auth cryptography", () => {
  it("hashes and verifies passwords correctly using bcrypt", async () => {
    const password = "super-secret-admin-pass";
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrong-password", hash)).toBe(false);
  });

  it("produces strong unique token entropy", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      const token = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(token).toHaveLength(64);
      expect(tokens.has(token)).toBe(false);
      tokens.add(token);
    }
  });
});
