"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Minta izin notifikasi agar pengumuman live & pengingat jadwal muncul walau tab tidak aktif. */
export function NotificationOptIn() {
  const [state, setState] = useState<NotificationPermission | "unsupported" | null>(null);
  useEffect(() => {
    setState("Notification" in window ? Notification.permission : "unsupported");
  }, []);
  if (state !== "default") return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-telu-red/40 p-4">
      <BellRing className="size-6 shrink-0 text-primary" aria-hidden />
      <p className="flex-1 text-sm">Aktifkan notifikasi untuk pengingat sesi & pengumuman.</p>
      <Button size="sm" variant="subtle" onClick={async () => {
        const p = await Notification.requestPermission();
        setState(p);
        if (p === "granted") toast.success("Notifikasi aktif");
      }}>Aktifkan</Button>
    </div>
  );
}
