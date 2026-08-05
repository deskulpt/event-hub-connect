import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { translate, RTL_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import type { AccessibilityPrefs } from "@/types/community";

interface PreferencesValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  accessibility: AccessibilityPrefs;
  setAccessibility: (prefs: AccessibilityPrefs) => Promise<void>;
  localityId: string | null;
  setLocalityId: (id: string) => Promise<void>;
  interests: string[];
  setInterests: (values: string[]) => Promise<void>;
  t: (key: string) => string;
}

const PreferencesContext = createContext<PreferencesValue | undefined>(undefined);

const LOCAL_KEY = "community-prefs";

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [accessibility, setAccessibilityState] = useState<AccessibilityPrefs>({
    textScale: "normal",
    contrast: "normal",
    readAloud: false,
    reduceMotion: false,
  });
  const [localityId, setLocalityIdState] = useState<string | null>(null);
  const [interests, setInterestsState] = useState<string[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { language?: LanguageCode; accessibility?: AccessibilityPrefs };
        if (parsed.language) setLanguageState(parsed.language);
        if (parsed.accessibility) setAccessibilityState((prev) => ({ ...prev, ...parsed.accessibility }));
      } catch (_error) {
        localStorage.removeItem(LOCAL_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const record = profile as unknown as {
      preferred_language?: LanguageCode;
      accessibility_prefs?: AccessibilityPrefs;
      locality_id?: string | null;
      interests?: string[];
    } | null;
    if (!record) return;
    if (record.preferred_language) setLanguageState(record.preferred_language);
    if (record.accessibility_prefs) setAccessibilityState((prev) => ({ ...prev, ...record.accessibility_prefs }));
    setLocalityIdState(record.locality_id ?? null);
    setInterestsState(record.interests ?? []);
  }, [profile]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", language);
    root.setAttribute("dir", RTL_LANGUAGES.includes(language) ? "rtl" : "ltr");
    root.classList.toggle("text-scale-large", accessibility.textScale === "large");
    root.classList.toggle("text-scale-xlarge", accessibility.textScale === "xlarge");
    root.classList.toggle("high-contrast", accessibility.contrast === "high");
    root.classList.toggle("reduce-motion", Boolean(accessibility.reduceMotion));
    root.classList.toggle("voice-first", Boolean(accessibility.readAloud));
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ language, accessibility }));
  }, [language, accessibility]);

  const persist = useCallback(
    async (patch: TablesUpdate<"profiles">) => {
      if (!user) return;
      await supabase.from("profiles").update(patch).eq("id", user.id);
      await refreshProfile();
    },
    [user, refreshProfile],
  );

  const value = useMemo<PreferencesValue>(
    () => ({
      language,
      accessibility,
      localityId,
      interests,
      t: (key: string) => translate(language, key),
      setLanguage: async (code) => {
        setLanguageState(code);
        await persist({ preferred_language: code });
      },
      setAccessibility: async (prefs) => {
        const next = { ...accessibility, ...prefs };
        setAccessibilityState(next);
        await persist({ accessibility_prefs: next });
      },
      setLocalityId: async (id) => {
        setLocalityIdState(id);
        await persist({ locality_id: id });
      },
      setInterests: async (values) => {
        setInterestsState(values);
        await persist({ interests: values });
      },
    }),
    [language, accessibility, localityId, interests, persist],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};
