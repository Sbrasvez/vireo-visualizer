import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the window scroll position to the top on every route change.
 * Mounted once inside <BrowserRouter> in App.tsx.
 *
 * Eccezione: se l'URL contiene un hash (#ancora), NON forziamo lo scroll a
 * top — la pagina di destinazione gestisce lo scroll fluido all'ancora
 * (vedi es. src/pages/Cookies.tsx). Questo evita il flash "top → ancora"
 * e altri effetti collaterali quando si naviga con deep-link.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    // Use "auto" so the jump is instant and not jarring on navigation.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash]);

  return null;
}
