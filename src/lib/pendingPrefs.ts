export type MaritalStatus =
  | "single"
  | "married"
  | "partnered"
  | "widowed"
  | "prefer_not";

export interface PendingPrefs {
  ageBand?: string;
  maritalStatus?: MaritalStatus;
  city?: string;
  localityId?: string | null;
  interests?: string[];
}

const KEY = "vibely:pendingPrefs";

export const savePendingPrefs = (prefs: PendingPrefs): void => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
};

export const readPendingPrefs = (): PendingPrefs | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingPrefs) : null;
  } catch {
    return null;
  }
};

export const clearPendingPrefs = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
};

export const AGE_BAND_OPTIONS = [
  { id: "50-54", label: "50–54" },
  { id: "55-59", label: "55–59" },
  { id: "60-64", label: "60–64" },
  { id: "65-69", label: "65–69" },
  { id: "70-74", label: "70–74" },
  { id: "75+", label: "75+" },
  { id: "under-50", label: "Under 50 · caregiver" },
] as const;

export const MARITAL_OPTIONS: { id: MaritalStatus; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "married", label: "Married" },
  { id: "partnered", label: "Partnered" },
  { id: "widowed", label: "Widowed" },
  { id: "prefer_not", label: "Prefer not to say" },
];

export const interestLabel = (interest: string): string =>
  interest
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
