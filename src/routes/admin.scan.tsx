import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, QrCode, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/scan")({
  head: () => ({
    meta: [
      { title: "Scan QR Entry — CAMPUSLY Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminScanPage,
});

type ScanResult =
  | { type: "success"; name: string; eventId: string; registrationId: string; scannedAt: string }
  | { type: "already_used"; registrationId: string }
  | { type: "not_found"; registrationId: string }
  | null;

function AdminScanPage() {
  const { authReady, isAdmin, refreshStats } = useAdmin();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (authReady && !isAdmin) {
      void navigate({ to: "/login", search: { redirect: "/admin/scan" } });
    }
  }, [authReady, isAdmin, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  if (!authReady) return null;
  if (!isAdmin) return null;

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    const registrationId = value.trim();
    if (!registrationId) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await adminService.scanQr(registrationId);
      void refreshStats();
      setResult({
        type: "success",
        name: res.fullName,
        eventId: res.eventId,
        registrationId: res.registrationId,
        scannedAt: res.scannedAt,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already")) {
        setResult({ type: "already_used", registrationId });
      } else if (msg.toLowerCase().includes("not found")) {
        setResult({ type: "not_found", registrationId });
      } else {
        setResult({ type: "not_found", registrationId });
      }
    } finally {
      setScanning(false);
      setValue("");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-2">
            <Link to="/admin/dashboard">
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
          </Button>
          <span className="font-display text-sm font-semibold text-primary">QR Entry Scanner</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-primary">
            <QrCode className="size-8" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Hall Entry Scanner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan or type the Registration ID from the attendee's QR code.
          </p>
        </div>

        <form
          onSubmit={handleScan}
          className="mt-8 space-y-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="space-y-2">
            <Label htmlFor="regId">Registration ID</Label>
            <Input
              ref={inputRef}
              id="regId"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. REG-CSE-2026-01234"
              className="h-12 rounded-xl font-mono text-base tracking-wider"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Point a USB/Bluetooth barcode scanner here — it auto-submits on scan.
            </p>
          </div>
          <Button
            type="submit"
            disabled={scanning || !value.trim()}
            size="lg"
            className="w-full rounded-full"
          >
            {scanning ? "Verifying..." : "Verify & Grant Entry"}
          </Button>
        </form>

        {result && (
          <div
            className={`mt-6 rounded-3xl p-6 text-center shadow-[var(--shadow-card)] border ${
              result.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            }`}
          >
            {result.type === "success" && (
              <>
                <CheckCircle2 className="mx-auto size-10 text-green-600" />
                <p className="mt-3 text-xl font-bold text-green-700 dark:text-green-400">Entry Granted ✓</p>
                <p className="mt-1 font-semibold">{result.name}</p>
                <p className="text-sm text-muted-foreground">{result.registrationId}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(result.scannedAt).toLocaleTimeString()}
                </p>
              </>
            )}
            {result.type === "already_used" && (
              <>
                <XCircle className="mx-auto size-10 text-red-500" />
                <p className="mt-3 text-xl font-bold text-red-600 dark:text-red-400">Already Used</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.registrationId} — This QR code has already been scanned.
                </p>
              </>
            )}
            {result.type === "not_found" && (
              <>
                <XCircle className="mx-auto size-10 text-red-500" />
                <p className="mt-3 text-xl font-bold text-red-600 dark:text-red-400">Not Found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No valid registration for "{result.registrationId}".
                </p>
              </>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Each QR code can only be scanned once. Duplicates are automatically rejected.
        </p>
      </main>
    </div>
  );
}
