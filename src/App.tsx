import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ShoppingListProvider } from "@/hooks/useShoppingList";
import Index from "./pages/Index.tsx";
import ShoppingList from "./pages/ShoppingList.tsx";
import Recipes from "./pages/Recipes.tsx";
import RecipeDetail from "./pages/RecipeDetail.tsx";
import Restaurants from "./pages/Restaurants.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Cart from "./pages/Cart.tsx";
import CheckoutReturn from "./pages/CheckoutReturn.tsx";
import Pricing from "./pages/Pricing.tsx";
import Blog from "./pages/Blog.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Profile from "./pages/Profile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AIChat from "./pages/AIChat.tsx";
import Surplus from "./pages/Surplus.tsx";
import MealPlan from "./pages/MealPlan.tsx";
import Community from "./pages/Community.tsx";
import Sell from "./pages/Sell.tsx";
import SellApply from "./pages/SellApply.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import AdminSellers from "./pages/AdminSellers.tsx";
import Store from "./pages/Store.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AIAssistantFAB } from "@/components/AIAssistantFAB";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ShoppingListProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:slug" element={<RecipeDetail />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/return" element={<CheckoutReturn />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai" element={<AIChat />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/surplus" element={<Surplus />} />
              <Route path="/meal-plan" element={<MealPlan />} />
              <Route path="/community" element={<Community />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/sell/apply" element={<SellApply />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="/store/:slug" element={<Store />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIAssistantFAB />
            </ShoppingListProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
