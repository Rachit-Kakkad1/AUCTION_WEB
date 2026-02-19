import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuctionProvider } from "@/context/AuctionContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import AuctionSelection from "./pages/AuctionSelection";
import Login from "./pages/Login";
import Controller from "./pages/Controller";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/select-auction" element={<AuctionSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auction" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/live-ops" element={<Controller />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuctionProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuctionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
