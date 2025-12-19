import { Outlet } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* CLEAN: React Router outlet for nested routes */}
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
