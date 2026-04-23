import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ShoppingListProvider } from "@/hooks/useShoppingList";
import { CookieConsentProvider } from "@/hooks/useCookieConsent";
import { AIAssistantFAB } from "@/components/AIAssistantFAB";
import ScrollToTop from "@/components/ScrollToTop";
import BackButtonFAB from "@/components/BackButtonFAB";
import Breadcrumbs from "@/components/Breadcrumbs";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import CookieBanner from "@/components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsentProvider>
          <AuthProvider>
            <CartProvider>
              <ShoppingListProvider>
                <ScrollToTop />
                <Breadcrumbs />
                <AnimatedRoutes />
                <BackButtonFAB />
                <AIAssistantFAB />
                <CookieBanner />
              </ShoppingListProvider>
            </CartProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
