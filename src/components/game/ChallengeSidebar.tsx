import { Link } from "@tanstack/react-router";
import { Scale, ListOrdered, ScanFace, Link2, Repeat, Vote, Swords, Building2, UserSearch, Route as RouteIcon, Mic, Tag, Shirt, BarChart3, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const SECTIONS = [
  {
    label: "Read the player",
    items: [
      { to: "/mystery", name: "Mystery Athlete", Icon: UserSearch, color: "text-secondary" },
      { to: "/silhouette", name: "Silhouette", Icon: ScanFace, color: "text-primary" },
      { to: "/nicknames", name: "Nicknames", Icon: Tag, color: "text-marker" },
      { to: "/draft-day", name: "Draft Day", Icon: Mic, color: "text-secondary" },
      { to: "/career-path", name: "Career Path", Icon: RouteIcon, color: "text-primary" },
      { to: "/trade-machine", name: "Trade Machine", Icon: Repeat, color: "text-marker" },
    ],
  },
  {
    label: "Stats & scores",
    items: [
      { to: "/top-10", name: "Top 10", Icon: ListOrdered, color: "text-marker" },
      { to: "/stat-line", name: "Stat Line", Icon: BarChart3, color: "text-secondary" },
      { to: "/head-to-head", name: "Head to Head", Icon: Swords, color: "text-primary" },
      { to: "/award-ballot", name: "Award Ballot", Icon: Vote, color: "text-secondary" },
    ],
  },
  {
    label: "Teams & places",
    items: [
      { to: "/locker-number", name: "Locker Number", Icon: Shirt, color: "text-primary" },
      { to: "/team-trio", name: "Team Trio", Icon: Users, color: "text-marker" },
      { to: "/jersey-chain", name: "Jersey Chain", Icon: Link2, color: "text-secondary" },
      { to: "/stadium-guesser", name: "Stadium Guesser", Icon: Building2, color: "text-primary" },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/rate-rarity", name: "Rate the Rarity", Icon: Scale, color: "text-secondary" },
      { to: "/facts", name: "Facts & Sources", Icon: BookOpen, color: "text-primary" },
    ],
  },
] as const;

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden className="h-px flex-1 bg-sidebar-border" />
      </h2>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function ChallengeSidebar() {
  return (
    <aside className="relative z-20 border-b-2 border-sidebar-border bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:left-0 md:w-52 md:border-b-0 md:border-r-2 lg:w-60">
      <div className="flex flex-col items-start gap-3 px-4 py-3 md:h-full md:overflow-y-auto md:px-5 md:py-8">
        <Link to="/" className="shrink-0 font-jersey text-2xl uppercase md:text-3xl">Niched</Link>
        <p className="hidden font-hand text-xl text-secondary md:mt-1 md:block">sports games</p>
        <nav aria-label="Sports games" className="hidden w-full min-w-0 flex-col gap-6 md:mt-8 md:flex">
          <Section label="Today">
            <Button asChild variant="ghost" className="h-11 min-w-0 justify-start gap-2 px-3 font-display text-xs">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "border-2 border-primary bg-sidebar-accent shadow-pop-sm" }}>
                <span aria-hidden>🏆</span><span>Daily Challenge</span>
              </Link>
            </Button>
          </Section>
          {SECTIONS.map(({ label, items }) => (
            <Section key={label} label={label}>
              {items.map(({ to, name, Icon, color }) => (
                <Button key={to} asChild variant="ghost" className="h-10 min-w-0 justify-start gap-2 px-3 font-display text-xs">
                  <Link to={to} activeProps={{ className: "border-2 border-primary bg-sidebar-accent shadow-pop-sm" }}><Icon className={color} /><span>{name}</span></Link>
                </Button>
              ))}
            </Section>
          ))}
        </nav>
      </div>
      <div aria-hidden className="absolute bottom-10 left-6 hidden -rotate-6 font-hand text-2xl text-muted-foreground md:block">{"\n"}</div>
    </aside>
  );
}
