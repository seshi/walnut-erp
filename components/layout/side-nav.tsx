"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  LayoutDashboard,
  Package,
  Wrench,
  ClipboardList,
  ShoppingCart,
  Boxes,
  TruckIcon,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects",  label: "Projects",   icon: FolderOpen,    active: true  },
  { href: "#",          label: "Dashboard",  icon: LayoutDashboard, active: false },
  { href: "/materials", label: "Materials",  icon: Package,       active: true  },
  { href: "/hardware",  label: "Hardware",   icon: Wrench,        active: true  },
  { href: "#",          label: "Cut Lists",  icon: ClipboardList, active: false },
  { href: "#",          label: "Production", icon: ShoppingCart,  active: false },
  { href: "#",          label: "Inventory",  icon: Boxes,         active: false },
  { href: "#",          label: "Purchasing", icon: TruckIcon,     active: false },
  { href: "#",          label: "Users",      icon: Users,         active: false },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col bg-walnut-500 text-stone-100 shrink-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-walnut-400 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-gold-400">
          <span className="text-xs font-bold text-walnut-500">WS</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-stone-100">Walnut Studios</p>
          <p className="mt-0.5 text-[10px] text-stone-400 uppercase tracking-wider">ERP</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, active }) => {
          const isCurrent = active && pathname.startsWith(href);
          const isDisabled = !active;
          return (
            <Link
              key={label}
              href={href}
              aria-disabled={isDisabled}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isCurrent
                  ? "bg-walnut-400 text-stone-100 font-medium"
                  : isDisabled
                  ? "text-stone-500 cursor-not-allowed"
                  : "text-stone-300 hover:bg-walnut-400 hover:text-stone-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isDisabled && (
                <span className="ml-auto text-[9px] uppercase tracking-wider text-stone-600 bg-walnut-600 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-walnut-400 px-3 py-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-stone-400 hover:text-stone-100 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="mt-2 flex items-center gap-2.5 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-walnut-400 flex items-center justify-center text-xs font-semibold text-stone-200">
            SR
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-stone-200">Seshi Reddy</p>
            <p className="truncate text-[10px] text-stone-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
