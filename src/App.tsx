import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkflowProvider } from "@/store/WorkflowContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WorkflowDetail from "./pages/WorkflowDetail";
import NewWorkflow from "./pages/NewWorkflow";
import ExecuteWorkflow from "./pages/ExecuteWorkflow";
import ExecutionDetail from "./pages/ExecutionDetail";
import Executions from "./pages/Executions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkflowProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/workflows/new" element={<NewWorkflow />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
            <Route path="/workflows/:id/execute" element={<ExecuteWorkflow />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/executions/:id" element={<ExecutionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkflowProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
