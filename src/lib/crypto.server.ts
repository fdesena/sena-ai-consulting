// Criptografia at-rest do token de acesso do WhatsApp (AES-256-GCM).
// Chave: TOKEN_ENCRYPTION_KEY (hex de 64 chars = 32 bytes), só em .env.local/Vercel.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("TOKEN_ENCRYPTION_KEY não configurada.");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY deve ter 32 bytes (64 caracteres hex).");
  }
  return key;
}

export function encryptToken(plaintext: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptToken(ciphertext: string, iv: string): string {
  const data = Buffer.from(ciphertext, "base64");
  const authTag = data.subarray(data.length - 16);
  const encrypted = data.subarray(0, data.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
