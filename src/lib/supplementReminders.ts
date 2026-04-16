import type { Supplement } from "@/types";
import type { FastingContext } from "@/lib/fasting";
import { FASTING_REFEED_SUPPLEMENT_TIME } from "@/lib/fasting";
import { combineDateKeyAndTime, getLocalDateKey } from "@/lib/date";

const REMINDER_OFFSET_MS = 5 * 60 * 1000;

export type SupplementReminderSlot = {
  id: string;
  scheduledDateKey: string;
  scheduledTime: string;
  scheduledAt: Date;
  remindAt: Date;
  title: string;
  body: string;
  items: string[];
};

function isShiftedToRefeed(supplement: Supplement) {
  return (
    !supplement.name.includes("Creatine") &&
    !supplement.name.includes("Magnesium")
  );
}

function resolveScheduledDateTime(
  dateKey: string,
  supplement: Supplement,
  fastingContext?: FastingContext | null,
) {
  const scheduledTime = supplement.timeRange.split("–")[0];

  if (!fastingContext || !isShiftedToRefeed(supplement)) {
    return {
      scheduledDateKey: dateKey,
      scheduledTime,
      scheduledAt: combineDateKeyAndTime(dateKey, scheduledTime),
    };
  }

  if (fastingContext.isStrictFastDay) {
    return {
      scheduledDateKey: fastingContext.currentFast.endDateKey,
      scheduledTime: FASTING_REFEED_SUPPLEMENT_TIME,
      scheduledAt: combineDateKeyAndTime(
        fastingContext.currentFast.endDateKey,
        FASTING_REFEED_SUPPLEMENT_TIME,
      ),
    };
  }

  if (fastingContext.isRefeedDay) {
    return {
      scheduledDateKey: dateKey,
      scheduledTime: FASTING_REFEED_SUPPLEMENT_TIME,
      scheduledAt: combineDateKeyAndTime(
        dateKey,
        FASTING_REFEED_SUPPLEMENT_TIME,
      ),
    };
  }

  const originalScheduledAt = combineDateKeyAndTime(dateKey, scheduledTime);
  const fallsInsideFastWindow =
    originalScheduledAt >= fastingContext.currentFast.startAt &&
    originalScheduledAt < fastingContext.currentFast.endAt;

  if (fallsInsideFastWindow) {
    return {
      scheduledDateKey: fastingContext.currentFast.endDateKey,
      scheduledTime: FASTING_REFEED_SUPPLEMENT_TIME,
      scheduledAt: combineDateKeyAndTime(
        fastingContext.currentFast.endDateKey,
        FASTING_REFEED_SUPPLEMENT_TIME,
      ),
    };
  }

  return {
    scheduledDateKey: dateKey,
    scheduledTime,
    scheduledAt: originalScheduledAt,
  };
}

export function getSupplementReminderSlots(
  dateKey: string,
  supplements: Supplement[],
  fastingContext?: FastingContext | null,
): SupplementReminderSlot[] {
  const grouped = new Map<
    string,
    { scheduledDateKey: string; scheduledAt: Date; items: string[] }
  >();

  for (const supplement of supplements) {
    const { scheduledDateKey, scheduledTime, scheduledAt } =
      resolveScheduledDateTime(dateKey, supplement, fastingContext);
    const label = `${supplement.name} (${supplement.dose})`;
    const groupKey = `${scheduledDateKey}_${scheduledTime}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        scheduledDateKey,
        scheduledAt,
        items: [label],
      });
      continue;
    }

    grouped.get(groupKey)!.items.push(label);
  }

  return Array.from(grouped.entries())
    .map(([groupKey, value]) => {
      const [scheduledDateKey, scheduledTime] = groupKey.split("_");
      const remindAt = new Date(value.scheduledAt.getTime() - REMINDER_OFFSET_MS);
      const itemList = value.items.join(", ");
      const isDifferentDay = scheduledDateKey !== dateKey;
      const scheduledLabel = isDifferentDay
        ? `${scheduledDateKey} • ${scheduledTime}`
        : scheduledTime;

      return {
        id: `${scheduledDateKey}_${scheduledTime.replace(":", "")}`,
        scheduledDateKey,
        scheduledTime,
        scheduledAt: value.scheduledAt,
        remindAt,
        items: value.items,
        title: `Pengingat Suplemen • ${scheduledLabel}`,
        body: `5 menit lagi: ${itemList}`,
      };
    })
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export type DailyDigestInfo = {
  dayLabel: string;
  taskCount: number;
  fastingStatus: string;
};

const DAILY_DIGEST_TIME = "07:00";

export function getDailyDigestSlot(
  dateKey: string,
  info: DailyDigestInfo,
): SupplementReminderSlot {
  const scheduledAt = combineDateKeyAndTime(dateKey, DAILY_DIGEST_TIME);
  const remindAt = scheduledAt; // digest fires exactly at 07:00, not 5 min before

  return {
    id: `digest_${dateKey}`,
    scheduledDateKey: dateKey,
    scheduledTime: DAILY_DIGEST_TIME,
    scheduledAt,
    remindAt,
    items: [info.dayLabel],
    title: `arunav2 — Selamat pagi 🌅`,
    body: `${info.dayLabel} · ${info.taskCount} task · ${info.fastingStatus}`,
  };
}

export function formatReminderTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatReminderDateTime(date: Date) {
  const dateKey = getLocalDateKey(date);
  const today = getLocalDateKey();
  const timeLabel = formatReminderTime(date);

  if (dateKey === today) {
    return timeLabel;
  }

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);

  return `${dateLabel} • ${timeLabel}`;
}
