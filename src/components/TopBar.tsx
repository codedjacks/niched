import { Link } from "@tanstack/react-router";
import logoBar from "@/assets/logo-bar.png";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-background bg-paper shadow-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-2.5">
        <Link
          to="/"
          aria-label="Niched — home"
          className="flex items-center transition hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <img src={logoBar} alt="Niched" width={923} height={477} className="h-8 w-auto sm:h-10" />
        </Link>
        <p className="hidden font-hand text-lg text-paper-foreground sm:block">the rarity trivia game</p>
      </div>
    </header>
  );
}
