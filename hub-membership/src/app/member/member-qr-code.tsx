"use client";

import { QRCodeSVG } from "qrcode.react";

export function MemberQrCode({ value }: { value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <QRCodeSVG value={value} size={220} level="M" />
    </div>
  );
}
