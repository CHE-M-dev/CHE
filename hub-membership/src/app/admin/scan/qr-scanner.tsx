"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";

type ScanResult = { type: "success"; name: string } | { type: "error"; message: string };

const SCANNER_ELEMENT_ID = "qr-reader";

export function QrScanner() {
  const supabase = useMemo(() => createClient(), []);
  const busyRef = useRef(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {},
      )
      .catch((err) => setCameraError(String(err)));

    async function handleScan(decodedText: string) {
      if (busyRef.current) return;
      busyRef.current = true;

      const memberId = decodedText.trim();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setResult({ type: "error", message: "Not signed in." });
        resumeAfterDelay();
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from("profiles")
        .select("id, full_name, status")
        .eq("id", memberId)
        .single();

      if (memberError || !member) {
        setResult({ type: "error", message: "QR code not recognized." });
        resumeAfterDelay();
        return;
      }

      if (member.status !== "active") {
        setResult({ type: "error", message: `${member.full_name}'s membership is inactive.` });
        resumeAfterDelay();
        return;
      }

      const { error: insertError } = await supabase
        .from("check_ins")
        .insert({ member_id: member.id, scanned_by: user.id });

      if (insertError) {
        setResult({ type: "error", message: insertError.message });
        resumeAfterDelay();
        return;
      }

      setResult({ type: "success", name: member.full_name });
      resumeAfterDelay();
    }

    function resumeAfterDelay() {
      setTimeout(() => {
        busyRef.current = false;
      }, 2500);
    }

    return () => {
      scanner
        .stop()
        .catch(() => {})
        .finally(() => scanner.clear());
    };
  }, [supabase]);

  return (
    <div className="space-y-4">
      <div
        id={SCANNER_ELEMENT_ID}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200"
      />

      {cameraError && (
        <p className="text-center text-sm text-red-600">Could not access camera: {cameraError}</p>
      )}

      {result && (
        <div
          className={
            "mx-auto max-w-sm rounded-xl border p-4 text-center text-sm font-medium " +
            (result.type === "success"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-700")
          }
        >
          {result.type === "success" ? `Checked in: ${result.name}` : result.message}
        </div>
      )}
    </div>
  );
}
