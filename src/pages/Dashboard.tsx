import { FileText, Target, Globe, Shield, Plus, ArrowRight, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-heading-sm font-semibold">CVCraft</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-body-sm text-muted-foreground hidden sm:block">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-heading-lg font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-body-lg text-muted-foreground">
              What would you like to do today?
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <ActionCard
              icon={<Plus className="w-6 h-6" />}
              title="Create from Scratch"
              description="Start fresh with a guided form that adapts to your experience level"
              href="/create"
              color="accent"
            />
            <ActionCard
              icon={<Target className="w-6 h-6" />}
              title="Tailor to Job"
              description="Upload your CV and a job description to get a perfectly matched version"
              href="/tailor"
              color="default"
            />
            <ActionCard
              icon={<Globe className="w-6 h-6" />}
              title="Convert Format"
              description="Adapt your CV to meet specific country standards and expectations"
              href="/convert"
              color="default"
            />
            <ActionCard
              icon={<Shield className="w-6 h-6" />}
              title="ATS Check"
              description="Analyze your CV's compatibility with applicant tracking systems"
              href="/ats-check"
              color="default"
            />
          </div>

          {/* Recent CVs Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-sm font-semibold text-foreground">Recent CVs</h2>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-heading-sm font-medium text-foreground mb-2">
                No CVs yet
              </h3>
              <p className="text-body text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first CV or upload an existing one to get started.
              </p>
              <Link to="/create">
                <Button variant="accent">
                  Create your first CV
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const ActionCard = ({
  icon,
  title,
  description,
  href,
  color = "default"
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color?: "accent" | "default";
}) => (
  <Link to={href}>
    <div className={`group relative p-8 rounded-xl border transition-all duration-300 hover:shadow-lg ${
      color === "accent" 
        ? "bg-accent/5 border-accent/20 hover:border-accent/40" 
        : "bg-card border-border hover:border-muted-foreground/20"
    }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${
        color === "accent" 
          ? "bg-accent text-accent-foreground" 
          : "bg-secondary text-foreground"
      }`}>
        {icon}
      </div>
      <h3 className="text-heading-sm font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-body text-muted-foreground">
        {description}
      </p>
      <ArrowRight className="absolute top-8 right-8 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

export default Dashboard;
