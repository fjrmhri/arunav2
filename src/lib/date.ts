const DAY_MS = 24 * 60 * 60 * 1000;

function getDateParts(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function toUtcMidnight(dateKey: string) {
  const { year, month, day } = getDateParts(dateKey);
  return Date.UTC(year, month - 1, day);
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  const { year, month, day } = getDateParts(dateKey);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function combineDateKeyAndTime(dateKey: string, time: string): Date {
  const [hour, minute] = time.split(":").map(Number);
  const date = parseLocalDateKey(dateKey);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  return getLocalDateKey(addDays(parseLocalDateKey(dateKey), days));
}

export function diffCalendarDays(fromDateKey: string, toDateKey: string): number {
  return Math.round((toUtcMidnight(toDateKey) - toUtcMidnight(fromDateKey)) / DAY_MS);
}

export function getDateKeysInRange(
  startDateKey: string,
  endDateKey: string,
): string[] {
  if (diffCalendarDays(startDateKey, endDateKey) < 0) return [];

  const keys: string[] = [];
  let cursor = startDateKey;

  while (diffCalendarDays(cursor, endDateKey) >= 0) {
    keys.push(cursor);
    if (cursor === endDateKey) break;
    cursor = addDaysToDateKey(cursor, 1);
  }

  return keys;
}

export function isSameLocalDate(left: Date, right: Date): boolean {
  return getLocalDateKey(left) === getLocalDateKey(right);
}

export function getMonthDateRange(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDateKey: getLocalDateKey(start),
    endDateKey: getLocalDateKey(end),
  };
}
