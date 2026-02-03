import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuctionProvider } from "./context/AuctionContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Controller from "./pages/Controller";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuctionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auction" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/controller" element={<Controller />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuctionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
