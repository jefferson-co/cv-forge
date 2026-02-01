import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Codepen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "default" | "dashboard";
}

const Navbar = ({ variant = "default" }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={variant === "dashboard" ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Codepen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Modiq</span>
        </Link>
        
        {variant === "default" && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#features" 
                onClick={e => scrollToSection(e, 'features')} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={e => scrollToSection(e, 'how-it-works')} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <Link 
                to="/about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-foreground" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {variant === "default" && isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            <a 
              href="#features" 
              onClick={e => scrollToSection(e, 'features')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={e => scrollToSection(e, 'how-it-works')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              How It Works
            </a>
            <Link 
              to="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-center">Log in</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full justify-center">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
