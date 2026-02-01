import { useState, useEffect } from "react";
import { FileText, Target, Globe, Shield, Plus, ArrowRight, LogOut, User, Settings, ChevronDown, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (data?.full_name) {
          setFullName(data.full_name);
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">CVCraft</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm text-foreground">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Welcome Header */}
              <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  What would you like to do today?
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid sm:grid-cols-2 gap-5">
                <ActionCard
                  icon={<Plus className="w-6 h-6" />}
                  title="Create from Scratch"
                  description="Start fresh with a guided form that adapts to your experience level"
                  href="/create"
                  isPrimary
                />
                <ActionCard
                  icon={<Target className="w-6 h-6" />}
                  title="Tailor to Job"
                  description="Upload your CV and a job description to get a perfectly matched version"
                  href="/tailor"
                />
                <ActionCard
                  icon={<Globe className="w-6 h-6" />}
                  title="Convert Format"
                  description="Adapt your CV to meet specific country standards and expectations"
                  href="/convert"
                />
                <ActionCard
                  icon={<Shield className="w-6 h-6" />}
                  title="ATS Check"
                  description="Analyze your CV's compatibility with applicant tracking systems"
                  href="/ats-check"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <StatItem label="CVs created this month" value="0" />
                  <StatItem label="Average ATS score" value="—" />
                  <StatItem label="Jobs tailored" value="0" />
                </div>
              </div>

              {/* Recent CVs */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Recent CVs
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all
                  </Button>
                </div>
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No CVs yet</p>
                  <Link to="/create">
                    <Button size="sm" variant="outline">
                      Create your first CV
                    </Button>
                  </Link>
                </div>
              </div>

              {/* ATS Score History */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  ATS Score History
                </h3>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No ATS checks yet
                  </p>
                </div>
              </div>
            </div>
          </div>
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
  isPrimary = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  isPrimary?: boolean;
}) => (
  <Link to={href}>
    <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg h-full ${
      isPrimary 
        ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
        : "bg-card border-border hover:border-primary/30"
    }`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${
        isPrimary 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-foreground"
      }`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

export default Dashboard;
