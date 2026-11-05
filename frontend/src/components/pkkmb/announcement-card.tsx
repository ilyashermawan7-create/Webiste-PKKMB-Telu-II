import { Pin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function AnnouncementCard({ a, href }: { a: Announcement; href?: string }) {
  const body = (
    <article className="group h-full rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-telu-red/40 hover:shadow-md">
      <div className="flex items-center gap-2">
        <Badge>{a.category}</Badge>
        {a.is_pinned && <Badge variant="solid"><Pin />Disematkan</Badge>}
      </div>
      <h3 className="mt-3 line-clamp-2 font-bold group-hover:text-primary">{a.title}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{a.body}</p>
      <p className="mt-4 text-xs text-muted-foreground"><time dateTime={a.published_at}>{formatDate(a.published_at)}</time> · {a.author?.name ?? "Panitia PKKMB"}</p>
    </article>
  );
  return href ? <Link href={href} className="block h-full rounded-2xl">{body}</Link> : body;
}
