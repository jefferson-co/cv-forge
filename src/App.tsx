import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CVFormProvider } from "@/contexts/CVFormContext";
import { TailorCVProvider } from "@/contexts/TailorCVContext";
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

// Tailor CV flow pages
import TailorUploadPage from "./pages/tailor-cv/UploadPage";
import TailorProcessingPage from "./pages/tailor-cv/ProcessingPage";
import TailorComparisonPage from "./pages/tailor-cv/ComparisonPage";
import TailorEditPage from "./pages/tailor-cv/EditPage";
import TailorCountryPage from "./pages/tailor-cv/CountryPage";
import TailorTemplatePage from "./pages/tailor-cv/TailorTemplatePage";
import TailorDownloadPage from "./pages/tailor-cv/TailorDownloadPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CVFormProvider>
        <TailorCVProvider>
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
                {/* Tailor CV Flow */}
                <Route
                  path="/tailor-cv"
                  element={
                    <ProtectedRoute>
                      <TailorUploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/processing"
                  element={
                    <ProtectedRoute>
                      <TailorProcessingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/comparison"
                  element={
                    <ProtectedRoute>
                      <TailorComparisonPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/edit"
                  element={
                    <ProtectedRoute>
                      <TailorEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/country"
                  element={
                    <ProtectedRoute>
                      <TailorCountryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/template"
                  element={
                    <ProtectedRoute>
                      <TailorTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tailor-cv/download"
                  element={
                    <ProtectedRoute>
                      <TailorDownloadPage />
                    </ProtectedRoute>
                  }
                />
                {/* Legacy route - redirect to new flow */}
                <Route
                  path="/tailor"
                  element={
                    <ProtectedRoute>
                      <TailorUploadPage />
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
        </TailorCVProvider>
      </CVFormProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
