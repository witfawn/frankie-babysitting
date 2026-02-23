"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Baby, Menu, Home, Calendar, UserCircle, Gift, LogOut } from "lucide-react";

const navItems = [
  { href: "/parent/dashboard", label: "Dashboard", icon: Home },
  { href: "/parent/bookings", label: "My Bookings", icon: Calendar },
  { href: "/parent/refer", label: "Refer a Friend", icon: Gift },
  { href: "/parent/profile", label: "Profile", icon: UserCircle },
];

export function ParentNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 mb-8">
                <Baby className="w-6 h-6 text-pink-600" />
                <span className="font-bold text-lg">Frankie</span>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-pink-100 text-pink-900"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-100 text-red-600 mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <Baby className="w-6 h-6 text-pink-600" />
            <span className="font-bold text-lg hidden sm:inline">Frankie Babysitting</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? "bg-pink-100 text-pink-900"
                  : "hover:bg-slate-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="hidden lg:flex text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
