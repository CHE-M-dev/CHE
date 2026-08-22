import { QrScanner } from "@/app/admin/scan/qr-scanner";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Scan to check in</h1>
        <p className="text-sm text-neutral-500">
          Point the camera at a member&apos;s QR code from their app.
        </p>
      </div>
      <QrScanner />
    </div>
  );
}
