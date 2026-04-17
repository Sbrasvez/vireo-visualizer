import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the window scroll position to the top on every route change.
 * Mounted once inside <BrowserRouter> in App.tsx.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Use "auto" so the jump is instant and not jarring on navigation.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}
