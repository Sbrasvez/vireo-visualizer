import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";

export type CookieCategories = {
  necessary: true; // sempre attivo
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type EditableCategories = Omit<CookieCategories, "necessary">;

const STORAGE_KEY = "vireo-cookie-consent";
const CONSENT_VERSION = 1;

const DEFAULT_DRAFT: EditableCategories = {
  preferences: true,
  analytics: false,
  marketing: false,
};

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
  /** Stato corrente dei toggle (in dialog o non), riflette modifiche pendenti. */
  draftPrefs: EditableCategories;
  /** True quando draftPrefs differisce dall'ultimo consenso salvato. */
  isDirty: boolean;
  /** True per ~2.5s subito dopo un salvataggio (feedback visivo globale). */
  justUpdated: boolean;
  setDraftPref: (key: keyof EditableCategories, value: boolean) => void;
  setDraftPrefs: (next: EditableCategories) => void;
  /** Ripristina la draft all'ultimo consenso salvato (o ai default). */
  revertDraft: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Salva la draft corrente (o categorie esplicite). */
  savePreferences: (categories?: EditableCategories) => void;
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

function baselineFrom(consent: CookieCategories | null): EditableCategories {
  if (!consent) return DEFAULT_DRAFT;
  return {
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
  };
}

function prefsEqual(a: EditableCategories, b: EditableCategories) {
  return (
    a.preferences === b.preferences &&
    a.analytics === b.analytics &&
    a.marketing === b.marketing
  );
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieCategories | null>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [draftPrefs, setDraftPrefsState] = useState<EditableCategories>(DEFAULT_DRAFT);

  useEffect(() => {
    const stored = loadConsent();
    if (stored) {
      setConsent(stored.categories);
      setConsentDate(stored.date);
      setDraftPrefsState(baselineFrom(stored.categories));
    } else {
      setShowBanner(true);
      setDraftPrefsState(DEFAULT_DRAFT);
    }
  }, []);

  const baseline = useMemo(() => baselineFrom(consent), [consent]);
  const isDirty = useMemo(() => !prefsEqual(draftPrefs, baseline), [draftPrefs, baseline]);

  const apply = useCallback((c: CookieCategories) => {
    saveConsent(c);
    setConsent(c);
    setConsentDate(new Date().toISOString());
    setDraftPrefsState(baselineFrom(c));
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
    (categories?: EditableCategories) => {
      const target = categories ?? draftPrefs;
      apply({ necessary: true, ...target });
    },
    [apply, draftPrefs],
  );

  const setDraftPref = useCallback((key: keyof EditableCategories, value: boolean) => {
    setDraftPrefsState((p) => ({ ...p, [key]: value }));
  }, []);

  const setDraftPrefs = useCallback((next: EditableCategories) => {
    setDraftPrefsState(next);
  }, []);

  const revertDraft = useCallback(() => {
    setDraftPrefsState(baseline);
  }, [baseline]);

  const openPreferences = useCallback(() => setShowPreferences(true), []);
  const closePreferences = useCallback(() => {
    // Chiusura senza salvare: scartiamo eventuali modifiche pendenti
    setDraftPrefsState(baseline);
    setShowPreferences(false);
  }, [baseline]);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        consentDate,
        hasDecided: consent !== null,
        showBanner,
        showPreferences,
        draftPrefs,
        isDirty,
        setDraftPref,
        setDraftPrefs,
        revertDraft,
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
