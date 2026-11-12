import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMocks } from '../api/client';

/**
 * Ticket QR. Production encodes the bare ticket code; mock mode keeps a DEMO
 * prefix so sample codes are never confused with live credentials.
 */
export const TicketQR: React.FC<{ code: string; size?: number; className?: string }> = ({
  code,
  size = 160,
  className = '',
}) => {
  const payload = useMocks() ? `EDUPASS-DEMO:${code}` : code;
  return (
    <div className={`inline-flex rounded-md bg-white p-3 ${className}`}>
      <QRCodeSVG value={payload} size={size} level="M" title={`QR code for ticket ${code}`} />
    </div>
  );
};
