import { NavLink } from "react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import LocationDisplay from "../location/LocationDisplay";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Namaz", to: "/" },
  { label: "Ramzan", to: "/ramzan" },
  { label: "About", to: "/about" },
];

export default function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto max-w-2xl px-4 py-3 space-y-2">
        {/* Row 1: Brand + nav + theme / hamburger */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <a href="/" className="font-semibold text-lg tracking-tight">
            NamazNow
          </a>

          {/* Desktop nav + theme (hidden on small screens) */}
          <div className="hidden sm:flex items-center gap-3">
            <nav className="flex items-center gap-2 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "px-3 py-1.5 rounded-full transition-colors",
                      "border border-transparent",
                      isActive
                        ? "bg-muted text-foreground border-border font-medium"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
          </div>

          {/* Mobile: theme + hamburger (visible only on small screens) */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>

        {/* Row 2: Location full width (no more overlap) */}
        <div>
          <LocationDisplay className="w-full" />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "px-3 py-2 rounded-md",
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
