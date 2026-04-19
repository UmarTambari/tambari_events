"use client";

import QRCode from "react-qr-code";

interface TicketQRCodeProps {
  /** The raw QR data string stored in attendees.qrCodeUrl */
  value: string;
  /** Size in pixels — defaults to 120 */
  size?: number;
}

/**
 * Renders the QR code image from the stored data string.
 * Uses react-qr-code which renders as an SVG — crisp at any size.
 *
 * Drop this anywhere you need to show a ticket QR code.
 */
export function TicketQRCode({ value, size = 120 }: TicketQRCodeProps) {
  return (
    <div
      style={{ background: "white", padding: 8, display: "inline-block" }}
      className="rounded border border-gray-200"
    >
      <QRCode
        value={value}
        size={size}
        fgColor="#123524"
        bgColor="#FFFFFF"
        level="M"
      />
    </div>
  );
}
