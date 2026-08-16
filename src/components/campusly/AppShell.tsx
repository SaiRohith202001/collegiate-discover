import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Home, Search, Ticket, User, LayoutGrid } from "lucide-react";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";
import { brand } from "@/config/brand";

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
const activeProps = { className: "rounded-full px-4 py-2 text-sm font-semibold bg-secondary text-foreground" };

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" activeOptions={{ exact: true }} className={navLinkClass} activeProps={activeProps}>
              Home
            </Link>
            <Link to="/events" className={navLinkClass} activeProps={activeProps}>
              Explore
            </Link>
            <Link to="/events" search={{ category: "Hackathon" }} className={navLinkClass}>
              Categories
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search events"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Search className="size-5" />
            </button>
            <Link
              to="/registrations"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
              activeProps={activeProps}
            >
              My Registrations
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="flex size-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-ink-foreground"
            >
              SR
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <footer className="hidden border-t border-border/70 bg-card md:block">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">{brand.supporting}</p>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/events" className="hover:text-foreground">
              Explore
            </Link>
            <Link to="/saved" className="hover:text-foreground">
              Saved
            </Link>
            <Link to="/registrations" className="hover:text-foreground">
              Registrations
            </Link>
            <Link to="/profile" className="hover:text-foreground">
              Profile
            </Link>
          </nav>
        </div>
      </footer>

      <MobileNav onSearch={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

const mobileItemClass =
  "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors";
const mobileActiveProps = {
  className: "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-primary",
};

function MobileNav({ onSearch }: { onSearch: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex items-stretch px-2">
        <Link to="/" activeOptions={{ exact: true }} className={mobileItemClass} activeProps={mobileActiveProps}>
          <Home className="size-5" />
          Home
        </Link>
        <Link to="/events" className={mobileItemClass} activeProps={mobileActiveProps}>
          <Compass className="size-5" />
          Explore
        </Link>
        <button type="button" onClick={onSearch} className={mobileItemClass}>
          <LayoutGrid className="size-5" />
          Search
        </button>
        <Link to="/registrations" className={mobileItemClass} activeProps={mobileActiveProps}>
          <Ticket className="size-5" />
          Registrations
        </Link>
        <Link to="/profile" className={mobileItemClass} activeProps={mobileActiveProps}>
          <User className="size-5" />
          Profile
        </Link>
      </div>
    </nav>
  );
}