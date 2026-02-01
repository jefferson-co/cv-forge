import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

interface CreateCVLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

const CreateCVLayout = ({
  children,
  showBackButton = true,
  backTo = "/dashboard"
}: CreateCVLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="pt-24 pb-12 px-[20px]">
        <div className="container mx-auto max-w-4xl">
          {showBackButton && (
            <Link 
              to={backTo} 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default CreateCVLayout;