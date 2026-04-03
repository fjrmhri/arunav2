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
  id,
  label,
  detail,
  checked,
  onToggle,
  warningNote,
  isOptional,
  disabled,
}: ChecklistItemProps) {
  return (
    <div className="group">
      <button
        onClick={() => !disabled && onToggle(id)}
        disabled={disabled}
        className={cn(
          "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left",
          checked
            ? "bg-jade-950/40"
            : "bg-night-800/40 hover:bg-night-800/70 active:bg-night-700/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Checkbox */}
        <div
          className={cn(
            "mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200",
            checked
              ? "bg-jade-600 border-jade-600"
              : "border-night-500 bg-transparent group-hover:border-jade-700"
          )}
        >
          {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium transition-all duration-200",
                checked ? "line-through text-gray-500" : "text-gray-200"
              )}
            >
              {label}
            </span>
            {isOptional && (
              <span className="px-1.5 py-0 rounded text-[10px] font-display font-semibold bg-gray-800 text-gray-500">
                Opsional
              </span>
            )}
          </div>
          {detail && (
            <p
              className={cn(
                "mt-0.5 text-xs leading-relaxed transition-all duration-200",
                checked ? "text-gray-600" : "text-gray-500"
              )}
            >
              {detail}
            </p>
          )}
          {warningNote && !checked && (
            <p className="mt-1.5 text-xs text-yellow-400/80 leading-relaxed border-l-2 border-yellow-700/50 pl-2">
              {warningNote}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
