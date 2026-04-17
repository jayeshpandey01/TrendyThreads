import crypto from "crypto";

const QR_SECRET = process.env.QR_SECRET || "default_qr_secret_key_change_me";
const EXPIRY_SECONDS = 60; // QR valid for 60 seconds

/**
 * Generates a signed QR string containing userId and timestamp
 */
export function generateSignedQR(userId: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", QR_SECRET)
    .update(data)
    .digest("hex");

  return `${data}:${signature}`;
}

/**
 * Verifies the signed QR string and returns the userId if valid
 */
export function verifySignedQR(qrString: string): { userId: string } | null {
  try {
    const [userId, timestampStr, signature] = qrString.split(":");
    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);

    // Check expiry
    if (now - timestamp > EXPIRY_SECONDS) {
      console.error("QR Code expired");
      return null;
    }

    // Verify signature
    const data = `${userId}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", QR_SECRET)
      .update(data)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid QR signature");
      return null;
    }

    return { userId };
  } catch (error) {
    console.error("Error verifying QR:", error);
    return null;
  }
}
