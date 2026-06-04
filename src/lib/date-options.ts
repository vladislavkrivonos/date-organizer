export const ACTIVITIES = [
  "Spa-day",
  "Carting",
  "Pottery",
  "Couple's massage",
  "Snacks&Movies",
  "Wine&Dine",
  "Hike",
  "Padel",
] as const;

export type Activity = (typeof ACTIVITIES)[number];

export type DateOption = {
  value: string;
  day: number;
  month: string;
  weekOffset: number;
};

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function getDateOptions(now = new Date()): DateOption[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      value: toDateValue(date),
      day: date.getDate(),
      month: monthFormatter.format(date),
      weekOffset: (date.getDay() + 6) % 7,
    };
  });
}

export function formatDisplayDate(value: string) {
  const date = fromDateValue(value);

  if (!date) {
    return value;
  }

  return dayFormatter.format(date);
}

export function isAllowedDate(value: string, now = new Date()) {
  return getDateOptions(now).some((option) => option.value === value);
}

export function isActivity(value: unknown): value is Activity {
  return typeof value === "string" && ACTIVITIES.includes(value as Activity);
}
