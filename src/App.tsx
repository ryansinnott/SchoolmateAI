import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import WellbeingChat from "./pages/WellbeingChat";
import HoldenCaulfieldChat from "./pages/HoldenCaulfieldChat";
import CreateChatbot from "./pages/CreateChatbot";
import CustomChat from "./pages/CustomChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-chatbot" element={<CreateChatbot />} />
          <Route path="/chat/wellbeing" element={<WellbeingChat />} />
          <Route path="/chat/holden-caulfield" element={<HoldenCaulfieldChat />} />
          <Route path="/chat/custom/:botId" element={<CustomChat />} />
          <Route path="/chat/custom" element={<CustomChat />} />
          <Route path="/chat/:subjectId" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
