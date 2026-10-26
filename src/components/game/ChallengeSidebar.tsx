import { Link } from "@tanstack/react-router";
import { Grid3x3, UserSearch, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const topics = [
  { to: "/grid", name: "Daily Grid", Icon: Grid3x3, color: "text-primary" },
  { to: "/mystery", name: "Mystery Athlete", Icon: UserSearch, color: "text-secondary" },
  { to: "/higher-lower", name: "Higher / Lower", Icon: ArrowUpDown, color: "text-marker" },
] as const;

export function ChallengeSidebar() {
  return (
    <aside className="relative z-20 border-b-2 border-sidebar-border bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:left-0 md:w-52 md:border-b-0 md:border-r-2 lg:w-60">
      <div className="flex flex-col items-start gap-3 px-4 py-3 md:block md:px-5 md:py-8">
        <Link to="/" className="shrink-0 font-display text-xl font-bold md:text-2xl">Niched<span className="text-primary">.</span></Link>
        <p className="hidden font-hand text-xl text-secondary md:mt-1 md:block">sports games</p>
        <nav aria-label="Sports games" className="grid w-full min-w-0 grid-cols-4 gap-1 md:mt-10 md:flex md:flex-col md:gap-3">
          <Button asChild variant="ghost" className="h-11 min-w-0 justify-center px-1 font-display text-[9px] md:h-auto md:justify-start md:px-3 md:text-xs">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "bg-sidebar-accent text-primary" }}>🏆<span>Daily</span></Link>
          </Button>
          {topics.map(({ to, name, Icon, color }) => (
            <Button key={to} asChild variant="ghost" className="h-11 min-w-0 justify-center gap-1 px-1 font-display text-[9px] md:h-14 md:justify-start md:gap-2 md:px-3 md:text-xs">
              <Link to={to} activeProps={{ className: "border-2 border-primary bg-sidebar-accent shadow-pop-sm" }}><Icon className={color} /><span>{name}</span></Link>
            </Button>
          ))}
        </nav>
      </div>
      <div aria-hidden className="absolute bottom-10 left-6 hidden -rotate-6 font-hand text-2xl text-muted-foreground md:block">gym class ★<br /><span className="text-base">new games every day.</span></div>
    </aside>
  );
}