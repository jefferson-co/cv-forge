import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
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
  return <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Modiq</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-[20px]">
        <div className="container mx-auto max-w-4xl">
          {showBackButton && <Link to={backTo} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>}
          {children}
        </div>
      </main>
    </div>;
};
export default CreateCVLayout;