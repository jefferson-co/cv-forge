import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { CVFormProvider } from "@/contexts/CVFormContext";
import { TailorCVProvider } from "@/contexts/TailorCVContext";
import { ATSCheckProvider } from "@/contexts/ATSCheckContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateCV from "./pages/CreateCV";
import TailorCV from "./pages/TailorCV";
import ConvertCV from "./pages/ConvertCV";
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

// ATS Check flow pages
import ATSUploadPage from "./pages/ats-check/UploadPage";
import ATSAnalyzingPage from "./pages/ats-check/AnalyzingPage";
import ATSResultsPage from "./pages/ats-check/ResultsPage";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><PageTransition><CreateCV /></PageTransition></ProtectedRoute>} />
        <Route path="/create-cv" element={<ProtectedRoute><PageTransition><ExperienceLevelPage /></PageTransition></ProtectedRoute>} />
        <Route path="/create-cv/form" element={<ProtectedRoute><PageTransition><FormPage /></PageTransition></ProtectedRoute>} />
        <Route path="/create-cv/preview" element={<ProtectedRoute><PageTransition><PreviewPage /></PageTransition></ProtectedRoute>} />
        <Route path="/create-cv/template" element={<ProtectedRoute><PageTransition><TemplatePage /></PageTransition></ProtectedRoute>} />
        <Route path="/create-cv/download" element={<ProtectedRoute><PageTransition><DownloadPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv" element={<ProtectedRoute><PageTransition><TailorUploadPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/processing" element={<ProtectedRoute><PageTransition><TailorProcessingPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/comparison" element={<ProtectedRoute><PageTransition><TailorComparisonPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/edit" element={<ProtectedRoute><PageTransition><TailorEditPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/country" element={<ProtectedRoute><PageTransition><TailorCountryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/template" element={<ProtectedRoute><PageTransition><TailorTemplatePage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor-cv/download" element={<ProtectedRoute><PageTransition><TailorDownloadPage /></PageTransition></ProtectedRoute>} />
        <Route path="/tailor" element={<ProtectedRoute><PageTransition><TailorUploadPage /></PageTransition></ProtectedRoute>} />
        <Route path="/convert" element={<ProtectedRoute><PageTransition><ConvertCV /></PageTransition></ProtectedRoute>} />
        <Route path="/ats-check" element={<ProtectedRoute><PageTransition><ATSUploadPage /></PageTransition></ProtectedRoute>} />
        <Route path="/ats-check/analyzing" element={<ProtectedRoute><PageTransition><ATSAnalyzingPage /></PageTransition></ProtectedRoute>} />
        <Route path="/ats-check/results" element={<ProtectedRoute><PageTransition><ATSResultsPage /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CVFormProvider>
        <TailorCVProvider>
          <ATSCheckProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ATSCheckProvider>
        </TailorCVProvider>
      </CVFormProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
