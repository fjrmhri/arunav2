"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  id: string;
  label: string;
  detail?: string;
  checked: boolean;
  onToggle: (id: string) => void;
  warningNote?: string;
  isOptional?: boolean;
  disabled?: boolean;
}

export default function ChecklistItem({
  id, label, detail, checked, onToggle, warningNote, isOptional, disabled,
}: ChecklistItemProps) {
  return (
    <div className="group">
      <button
        onClick={() => !disabled && onToggle(id)}
        disabled={disabled}
        className={cn(
          "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-150 text-left",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        style={{
          background: checked ? "var(--bg-elevated)" : "transparent",
          border: `1px solid ${checked ? "var(--border)" : "transparent"}`,
        }}
      >
        {/* Checkbox */}
        <div
          className="mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: checked ? "var(--text-primary)" : "var(--text-muted)",
            background: checked ? "var(--text-primary)" : "transparent",
          }}
        >
          {checked && <Check size={11} strokeWidth={3} style={{ color: "var(--bg)" }} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className="text-sm font-medium transition-all duration-150"
              style={{ color: checked ? "var(--text-muted)" : "var(--text-primary)",
                       textDecoration: checked ? "line-through" : "none" }}
            >
              {label}
            </span>
            {isOptional && (
              <span className="px-1.5 rounded text-[10px] font-display font-semibold"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                Opsional
              </span>
            )}
          </div>
          {detail && (
            <p className="mt-0.5 text-xs leading-relaxed"
               style={{ color: checked ? "var(--text-muted)" : "var(--text-secondary)" }}>
              {detail}
            </p>
          )}
          {warningNote && !checked && (
            <p className="mt-1.5 text-xs leading-relaxed pl-2 border-l-2"
               style={{ color: "var(--warning)", borderColor: "var(--warning)" }}>
              {warningNote}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
