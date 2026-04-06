"use client";

import { AlertTriangle, AlertCircle, Info, HelpCircle } from "lucide-react";
import { cn, getTagBadge } from "@/lib/utils";
import type { SafetyNote } from "@/types";

interface SafetyCardProps {
  note: SafetyNote;
  compact?: boolean;
}

const ICON_MAP = {
  danger:  AlertCircle,
  warning: AlertTriangle,
  info:    Info,
  unknown: HelpCircle,
};

const SEVERITY_STYLE = {
  danger:  { border: "#3a1a1a", color: "var(--danger)" },
  warning: { border: "#5a3a1a", color: "var(--warning)" },
  info:    { border: "var(--border)", color: "var(--text-secondary)" },
  unknown: { border: "var(--border)", color: "var(--text-muted)" },
};

export default function SafetyCard({ note, compact }: SafetyCardProps) {
  const Icon = ICON_MAP[note.severity];
  const style = SEVERITY_STYLE[note.severity];
  const tagClass = getTagBadge(note.tag);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--bg-card)", border: `1px solid ${style.border}` }}
    >
      <div className="flex items-start gap-3">
        <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: style.color }} strokeWidth={2.5} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {note.tag && (
              <span className={cn("badge", tagClass)}>{note.tag}</span>
            )}
            <span className="text-[10px] font-display uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {note.source}
            </span>
          </div>
          <p className="text-sm font-semibold font-display leading-snug mb-1" style={{ color: "var(--text-primary)" }}>
            {note.title}
          </p>
          {!compact && (
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{note.body}</p>
          )}
        </div>
      </div>
    </div>
  );
}
