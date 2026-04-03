"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/planner",
    label: "Planner",
    icon: Calendar,
  },
  {
    href: "/tracker",
    label: "Tracker",
    icon: CheckSquare,
  },
  {
    href: "/safety",
    label: "Progress",
    icon: BarChart3,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="mx-3 mb-3 rounded-2xl border border-night-700/80 bg-night-900/95 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-jade-900/70 text-jade-400"
                      : "text-gray-600 hover:text-gray-400 active:bg-night-800"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "text-jade-400" : "text-gray-600"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-display font-semibold tracking-wide transition-all duration-200",
                      isActive ? "text-jade-400" : "text-gray-600"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area spacer */}
      <div className="h-safe pb-safe" />
    </nav>
  );
}
