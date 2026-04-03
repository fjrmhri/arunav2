"use client";

import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export default function Header({
  title,
  subtitle,
  rightElement,
  className,
}: HeaderProps) {
  return (
    <header className={cn("px-5 pt-12 pb-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-100 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {rightElement && (
          <div className="mt-1 flex-shrink-0">{rightElement}</div>
        )}
      </div>
    </header>
  );
}
