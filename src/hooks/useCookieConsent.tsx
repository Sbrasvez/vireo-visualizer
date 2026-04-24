import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type CookieCategories = {
  necessary: true; // sempre attivo
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "vireo-cookie-consent";
const CONSENT_VERSION = 1;

type StoredConsent = {
  version: number;
  date: string;
  categories: CookieCategories;
};

type Ctx = {
  consent: CookieCategories | null;
  consentDate: string | null;
  hasDecided: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (categories: Omit<CookieCategories, "necessary">) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<Ctx | undefined>(undefined);

function loadConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(categories: CookieCategories) {
  const data: StoredConsent = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    categories,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieCategories | null>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const stored = loadConsent();
    if (stored) {
      setConsent(stored.categories);
      setConsentDate(stored.date);
    } else {
      setShowBanner(true);
    }
  }, []);

  const apply = useCallback((c: CookieCategories) => {
    saveConsent(c);
    setConsent(c);
    setConsentDate(new Date().toISOString());
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const acceptAll = useCallback(() => {
    apply({ necessary: true, preferences: true, analytics: true, marketing: true });
  }, [apply]);

  const rejectAll = useCallback(() => {
    apply({ necessary: true, preferences: false, analytics: false, marketing: false });
  }, [apply]);

  const savePreferences = useCallback(
    (categories: Omit<CookieCategories, "necessary">) => {
      apply({ necessary: true, ...categories });
    },
    [apply],
  );

  const openPreferences = useCallback(() => setShowPreferences(true), []);
  const closePreferences = useCallback(() => setShowPreferences(false), []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        consentDate,
        hasDecided: consent !== null,
        showBanner,
        showPreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        openPreferences,
        closePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used inside CookieConsentProvider");
  return ctx;
}
