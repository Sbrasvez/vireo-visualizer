import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import Index from "@/pages/Index";
import ShoppingList from "@/pages/ShoppingList";
import Recipes from "@/pages/Recipes";
import RecipeDetail from "@/pages/RecipeDetail";
import Restaurants from "@/pages/Restaurants";
import Marketplace from "@/pages/Marketplace";
import Cart from "@/pages/Cart";
import CheckoutReturn from "@/pages/CheckoutReturn";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import AIChat from "@/pages/AIChat";
import Surplus from "@/pages/Surplus";
import MealPlan from "@/pages/MealPlan";
import Community from "@/pages/Community";
import Sell from "@/pages/Sell";
import SellApply from "@/pages/SellApply";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminSellers from "@/pages/AdminSellers";
import AdminRestaurants from "@/pages/AdminRestaurants";
import Store from "@/pages/Store";
import ProductDetail from "@/pages/ProductDetail";
import Wishlist from "@/pages/Wishlist";
import PublicWishlist from "@/pages/PublicWishlist";
import NotFound from "@/pages/NotFound";
import PreviewGreenScore from "@/pages/PreviewGreenScore";
import RestaurantOwnerDashboard from "@/pages/RestaurantOwnerDashboard";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";

const wrap = (node: React.ReactNode) => <PageTransition>{node}</PageTransition>;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(<Index />)} />
        <Route path="/recipes" element={wrap(<Recipes />)} />
        <Route path="/recipes/:slug" element={wrap(<RecipeDetail />)} />
        <Route path="/restaurants" element={wrap(<Restaurants />)} />
        <Route path="/marketplace" element={wrap(<Marketplace />)} />
        <Route path="/cart" element={wrap(<Cart />)} />
        <Route path="/checkout/return" element={wrap(<CheckoutReturn />)} />
        <Route path="/pricing" element={wrap(<Pricing />)} />
        <Route path="/blog" element={wrap(<Blog />)} />
        <Route path="/login" element={wrap(<Login />)} />
        <Route path="/signup" element={wrap(<Signup />)} />
        <Route path="/forgot-password" element={wrap(<ForgotPassword />)} />
        <Route path="/reset-password" element={wrap(<ResetPassword />)} />
        <Route path="/profile" element={wrap(<Profile />)} />
        <Route path="/dashboard" element={wrap(<Dashboard />)} />
        <Route path="/ai" element={wrap(<AIChat />)} />
        <Route path="/shopping-list" element={wrap(<ShoppingList />)} />
        <Route path="/surplus" element={wrap(<Surplus />)} />
        <Route path="/meal-plan" element={wrap(<MealPlan />)} />
        <Route path="/community" element={wrap(<Community />)} />
        <Route path="/sell" element={wrap(<Sell />)} />
        <Route path="/sell/apply" element={wrap(<SellApply />)} />
        <Route path="/seller/dashboard" element={wrap(<SellerDashboard />)} />
        <Route path="/admin/sellers" element={wrap(<AdminSellers />)} />
        <Route path="/admin/restaurants" element={wrap(<AdminRestaurants />)} />
        <Route path="/restaurant/dashboard" element={wrap(<RestaurantOwnerDashboard />)} />
        <Route path="/store/:slug" element={wrap(<Store />)} />
        <Route path="/product/:slug" element={wrap(<ProductDetail />)} />
        <Route path="/wishlist" element={wrap(<Wishlist />)} />
        <Route path="/wishlist/:userId" element={wrap(<PublicWishlist />)} />
        <Route path="/preview/green-score" element={wrap(<PreviewGreenScore />)} />
        <Route path="/privacy" element={wrap(<Privacy />)} />
        <Route path="/terms" element={wrap(<Terms />)} />
        <Route path="/cookies" element={wrap(<Cookies />)} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={wrap(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
