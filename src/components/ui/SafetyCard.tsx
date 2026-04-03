"use client";

import { AlertTriangle, AlertCircle, Info, HelpCircle } from "lucide-react";
import { cn, getSeverityColor, getTagBadge } from "@/lib/utils";
import type { SafetyNote } from "@/types";

interface SafetyCardProps {
  note: SafetyNote;
  compact?: boolean;
}

const ICON_MAP = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  unknown: HelpCircle,
};

export default function SafetyCard({ note, compact }: SafetyCardProps) {
  const Icon = ICON_MAP[note.severity];
  const colorClass = getSeverityColor(note.severity);
  const tagClass = getTagBadge(note.tag);

  return (
    <div className={cn("rounded-xl border p-4", colorClass)}>
      <div className="flex items-start gap-3">
        <Icon
          size={16}
          className="flex-shrink-0 mt-0.5 opacity-80"
          strokeWidth={2.5}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {note.tag && (
              <span className={cn("badge text-[10px]", tagClass)}>
                {note.tag}
              </span>
            )}
            <span className="text-[10px] font-display uppercase tracking-wide opacity-60">
              {note.source}
            </span>
          </div>
          <p className="text-sm font-semibold font-display leading-snug mb-1">
            {note.title}
          </p>
          {!compact && (
            <p className="text-xs leading-relaxed opacity-80">{note.body}</p>
          )}
        </div>
      </div>
    </div>
  );
}
