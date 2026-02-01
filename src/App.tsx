import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CVFormProvider } from "@/contexts/CVFormContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateCV from "./pages/CreateCV";
import TailorCV from "./pages/TailorCV";
import ConvertCV from "./pages/ConvertCV";
import ATSCheck from "./pages/ATSCheck";
import NotFound from "./pages/NotFound";

// Create CV flow pages
import ExperienceLevelPage from "./pages/create-cv/ExperienceLevelPage";
import FormPage from "./pages/create-cv/FormPage";
import PreviewPage from "./pages/create-cv/PreviewPage";
import TemplatePage from "./pages/create-cv/TemplatePage";
import DownloadPage from "./pages/create-cv/DownloadPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CVFormProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateCV />
                  </ProtectedRoute>
                }
              />
              {/* Create CV Flow */}
              <Route
                path="/create-cv"
                element={
                  <ProtectedRoute>
                    <ExperienceLevelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-cv/form"
                element={
                  <ProtectedRoute>
                    <FormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-cv/preview"
                element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-cv/template"
                element={
                  <ProtectedRoute>
                    <TemplatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-cv/download"
                element={
                  <ProtectedRoute>
                    <DownloadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tailor"
                element={
                  <ProtectedRoute>
                    <TailorCV />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/convert"
                element={
                  <ProtectedRoute>
                    <ConvertCV />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ats-check"
                element={
                  <ProtectedRoute>
                    <ATSCheck />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CVFormProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
