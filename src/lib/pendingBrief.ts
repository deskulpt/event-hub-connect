export interface PendingBrief {
  type?: string;
  guests?: number;
  date?: string; // ISO
  city?: string;
  title?: string;
}

const KEY = "vibely:pendingBrief";

export const savePendingBrief = (b: PendingBrief): void => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* noop */
  }
};

export const readPendingBrief = (): PendingBrief | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingBrief) : null;
  } catch {
    return null;
  }
};

export const clearPendingBrief = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
};

const TYPE_TO_EVENT_TYPE: Record<string, string> = {
  casual: "social",
  birthday: "birthday",
  corporate: "corporate",
  "at-home": "social",
  wedding: "wedding",
  conference: "conference",
  dinner: "social",
};

export const briefToEventTypeSlug = (type?: string): string | undefined => {
  if (!type) return undefined;
  return TYPE_TO_EVENT_TYPE[type] ?? "other";
};

export const briefToTitle = (b: PendingBrief): string => {
  if (b.title && b.title.trim().length > 1) return b.title.trim();
  const map: Record<string, string> = {
    casual: "Casual gathering",
    birthday: "Birthday celebration",
    corporate: "Corporate event",
    "at-home": "At-home experience",
    wedding: "Wedding",
    conference: "Conference",
    dinner: "Dinner party",
  };
  const base = b.type ? map[b.type] ?? "My event" : "My event";
  return b.city ? `${base} in ${b.city}` : base;
};
