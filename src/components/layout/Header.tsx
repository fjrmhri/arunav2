"use client";

import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export default function Header({ title, subtitle, rightElement, className }: HeaderProps) {
  return (
    <header className={cn("px-5 pt-12 pb-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          )}
        </div>
        {rightElement && <div className="mt-0.5 flex-shrink-0">{rightElement}</div>}
      </div>
    </header>
  );
}
