/**
 * Generates the data payload that gets encoded into the QR code.
 *
 * We store this string in attendees.qrCodeUrl (used as qrCodeData).
 * The frontend renders it as a QR image using react-qr-code.
 * The download API generates a PNG from it server-side using the qrcode package.
 *
 * The payload is a JSON string containing just enough data for
 * the check-in scanner to verify a ticket without a network call.
 */

export interface QRCodePayload {
  ticketCode: string;
  attendeeId: string;
  eventId: string;
}

export function generateQRData(payload: QRCodePayload): string {
  return JSON.stringify({
    ticketCode: payload.ticketCode,
    attendeeId: payload.attendeeId,
    eventId: payload.eventId,
  });
}

/**
 * Parses the QR code data string back into a structured payload.
 * Used by the check-in scanner to extract ticket information.
 */
export function parseQRData(data: string): QRCodePayload | null {
  try {
    const parsed = JSON.parse(data);
    if (
      typeof parsed.ticketCode === "string" &&
      typeof parsed.attendeeId === "string" &&
      typeof parsed.eventId === "string"
    ) {
      return parsed as QRCodePayload;
    }
    return null;
  } catch {
    return null;
  }
}