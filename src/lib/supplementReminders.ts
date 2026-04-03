import type { Supplement } from "@/types";

const FASTING_REFEED_TIME = "08:00";
const REMINDER_OFFSET_MS = 5 * 60 * 1000;

export type SupplementReminderSlot = {
  id: string;
  scheduledTime: string;
  scheduledAt: Date;
  remindAt: Date;
  title: string;
  body: string;
  items: string[];
};

function isShiftedToRefeed(supplement: Supplement, isFastingDay: boolean) {
  return (
    isFastingDay &&
    !supplement.name.includes("Creatine") &&
    !supplement.name.includes("Magnesium")
  );
}

function getScheduledTime(supplement: Supplement, isFastingDay: boolean) {
  if (isShiftedToRefeed(supplement, isFastingDay)) {
    return FASTING_REFEED_TIME;
  }

  return supplement.timeRange.split("–")[0];
}

function toLocalDateTime(dateKey: string, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(`${dateKey}T00:00:00`);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function getSupplementReminderSlots(
  dateKey: string,
  supplements: Supplement[],
  isFastingDay: boolean
): SupplementReminderSlot[] {
  const grouped = new Map<
    string,
    { scheduledAt: Date; items: string[] }
  >();

  for (const supplement of supplements) {
    const scheduledTime = getScheduledTime(supplement, isFastingDay);
    const scheduledAt = toLocalDateTime(dateKey, scheduledTime);
    const label = `${supplement.name} (${supplement.dose})`;

    if (!grouped.has(scheduledTime)) {
      grouped.set(scheduledTime, {
        scheduledAt,
        items: [label],
      });
      continue;
    }

    grouped.get(scheduledTime)!.items.push(label);
  }

  return Array.from(grouped.entries())
    .map(([scheduledTime, value]) => {
      const remindAt = new Date(value.scheduledAt.getTime() - REMINDER_OFFSET_MS);
      const itemList = value.items.join(", ");

      return {
        id: `${dateKey}_${scheduledTime.replace(":", "")}`,
        scheduledTime,
        scheduledAt: value.scheduledAt,
        remindAt,
        items: value.items,
        title: `Pengingat Suplemen • ${scheduledTime}`,
        body: `5 menit lagi: ${itemList}`,
      };
    })
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function formatReminderTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
