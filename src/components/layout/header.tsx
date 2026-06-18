"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarContent } from "./sidebar";
import { NAV_ITEMS } from "@/constants/navigation";
import { ActiveCertBadge } from "./active-cert-badge";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const current = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b glass px-4 sm:px-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full w-72 max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-r p-0 sm:rounded-none">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <GraduationCap className="h-5 w-5 text-primary" />
        <span className="font-bold">CertPath</span>
      </Link>

      <div className="hidden lg:block">
        <h2 className="text-sm font-semibold">{current?.label ?? "CertPath AI"}</h2>
        <p className="text-xs text-muted-foreground">{current?.description}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ActiveCertBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
