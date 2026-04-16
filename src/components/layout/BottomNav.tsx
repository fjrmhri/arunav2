"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner",   icon: Calendar },
  { href: "/tracker", label: "Tracker",   icon: CheckSquare },
  { href: "/safety",  label: "Progress",  icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div
        className="mx-4 mb-4 rounded-2xl flex items-center justify-around px-2 py-2"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-150",
                  isActive ? "bg-[#222]" : "hover:bg-[#1a1a1a] active:bg-[#222]"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                />
                <span
                  className="text-[10px] font-display font-semibold tracking-wide"
                  style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="pb-safe" />
    </nav>
  );
}
