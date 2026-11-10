import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Demo QR code. It encodes only the ticket code with a DEMO prefix, so it is
 * never mistaken for a real admission credential.
 */
export const TicketQR: React.FC<{ code: string; size?: number; className?: string }> = ({ code, size = 160, className = '' }) => (
  <div className={`inline-flex rounded-md bg-white p-3 ${className}`}>
    <QRCodeSVG value={`EDUPASS-DEMO:${code}`} size={size} level="M" title={`Demo QR code for ticket ${code}`} />
  </div>
);
