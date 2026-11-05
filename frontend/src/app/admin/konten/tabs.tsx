"use client";

import { ContentManager } from "@/components/dashboard/content-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role } from "@/lib/types";
import { RESOURCES } from "./resources";

export function ContentTabs({ role }: { role: Role }) {
  // Panitia hanya boleh membuat pengumuman; CRUD penuh khusus admin
  const list = role === "ADMIN" ? RESOURCES : RESOURCES.filter((r) => r.resource === "announcements");
  return (
    <Tabs defaultValue={list[0]!.resource}>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"><TabsList className="flex-nowrap">{list.map((r) => <TabsTrigger key={r.resource} value={r.resource} className="shrink-0">{r.title}</TabsTrigger>)}</TabsList></div>
      {list.map((r) => <TabsContent key={r.resource} value={r.resource} className="mt-6"><ContentManager config={r} canWrite={role === "ADMIN" || r.resource === "announcements"} /></TabsContent>)}
    </Tabs>
  );
}
