import { Link } from "@tanstack/react-router";
import { Home, Trophy, Clapperboard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const topics = [
  { to: "/sports", name: "Sports", Icon: Trophy, color: "text-primary" },
  { to: "/entertainment", name: "Entertainment", Icon: Clapperboard, color: "text-secondary" },
  { to: "/history", name: "History", Icon: Landmark, color: "text-marker" },
] as const;

export function ChallengeSidebar() {
  return (
    <aside className="relative z-20 border-b-2 border-sidebar-border bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:left-0 md:w-52 md:border-b-0 md:border-r-2 lg:w-60">
      <div className="flex items-center gap-3 px-4 py-3 md:block md:px-5 md:py-8">
        <Link to="/" className="shrink-0 font-display text-xl font-bold md:text-2xl">Niched<span className="text-primary">.</span></Link>
        <p className="hidden font-hand text-xl text-secondary md:mt-1 md:block">the extracurriculars</p>
        <nav aria-label="Challenges" className="flex min-w-0 flex-1 gap-1 overflow-x-auto md:mt-10 md:flex-col md:gap-3">
          <Button asChild variant="ghost" className="hidden justify-start font-display text-xs md:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "bg-sidebar-accent text-primary" }}><Home />Daily / Practice</Link>
          </Button>
          {topics.map(({ to, name, Icon, color }) => (
            <Button key={to} asChild variant="ghost" className="h-11 shrink-0 justify-start gap-2 px-2 font-display text-[10px] md:h-14 md:px-3 md:text-xs">
              <Link to={to} activeProps={{ className: "border-2 border-primary bg-sidebar-accent shadow-pop-sm" }}><Icon className={color} /><span>{name}</span></Link>
            </Button>
          ))}
        </nav>
      </div>
      <div aria-hidden className="absolute bottom-10 left-6 hidden -rotate-6 font-hand text-2xl text-muted-foreground md:block">extra credit ★<br /><span className="text-base">same class. different subject.</span></div>
    </aside>
  );
}