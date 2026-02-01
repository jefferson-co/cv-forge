import { useState, useEffect } from "react";
import { FileText, LogOut, User, Settings, ChevronDown, BarChart3, Clock, Calendar, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CreateCVDropdown } from "@/components/dashboard/CreateCVDropdown";
import { CVPreviewModal } from "@/components/dashboard/CVPreviewModal";
import { format } from "date-fns";
import { CVFormData } from "@/types/cv";

interface CV {
  id: string;
  title: string;
  type: string;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
  content: CVFormData | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CV | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    const fetchCvs = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (!error && data) {
          // Cast the content field properly
          const typedCvs: CV[] = data.map(cv => ({
            ...cv,
            content: cv.content as unknown as CVFormData | null,
          }));
          setCvs(typedCvs);
        }
        setLoadingCvs(false);
      }
    };
    fetchCvs();
  }, [user]);

  const handleCVClick = (cv: CV) => {
    setSelectedCV(cv);
    setIsPreviewOpen(true);
  };

  const handleEditCV = (cvId: string) => {
    setIsPreviewOpen(false);
    navigate(`/create-cv/form?edit=${cvId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, cv: CV) => {
    e.stopPropagation();
    setCvToDelete(cv);
  };

  const handleConfirmDelete = async () => {
    if (!cvToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvToDelete.id);

      if (error) throw error;

      setCvs(prev => prev.filter(cv => cv.id !== cvToDelete.id));
      toast.success("CV deleted successfully");
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error("Failed to delete CV");
    } finally {
      setIsDeleting(false);
      setCvToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  const hasNoCvs = cvs.length === 0;

  // Calculate stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const cvsThisMonth = cvs.filter(cv => {
    const cvDate = new Date(cv.created_at);
    return cvDate.getMonth() === currentMonth && cvDate.getFullYear() === currentYear;
  }).length;

  const avgAtsScore = cvs.filter(cv => cv.ats_score !== null).length > 0
    ? Math.round(cvs.filter(cv => cv.ats_score !== null).reduce((acc, cv) => acc + (cv.ats_score || 0), 0) / cvs.filter(cv => cv.ats_score !== null).length)
    : null;

  const tailoredCount = cvs.filter(cv => cv.type === 'tailored').length;

  if (loadingCvs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

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
          {hasNoCvs ? (
            <EmptyState />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Welcome Header with Create Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      Welcome back, {firstName}!
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      What would you like to do today?
                    </p>
                  </div>
                  <CreateCVDropdown />
                </div>

                {/* Recent CVs List */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Your CVs</h2>
                  <div className="grid gap-4">
                    {cvs.slice(0, 5).map((cv) => (
                      <CVCard key={cv.id} cv={cv} onClick={() => handleCVClick(cv)} onDelete={(e) => handleDeleteClick(e, cv)} />
                    ))}
                  </div>
                  {cvs.length > 5 && (
                    <Button variant="outline" className="w-full">
                      View all {cvs.length} CVs
                    </Button>
                  )}
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
                    <StatItem label="CVs created this month" value={cvsThisMonth.toString()} />
                    <StatItem label="Average ATS score" value={avgAtsScore !== null ? `${avgAtsScore}%` : "—"} />
                    <StatItem label="Jobs tailored" value={tailoredCount.toString()} />
                  </div>
                </div>

                {/* ATS Score History */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    ATS Score History
                  </h3>
                  {cvs.filter(cv => cv.ats_score !== null).length > 0 ? (
                    <div className="space-y-3">
                      {cvs.filter(cv => cv.ats_score !== null).slice(0, 3).map((cv) => (
                        <div key={cv.id} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">{cv.title}</span>
                          <span className={`text-sm font-semibold ${
                            (cv.ats_score || 0) >= 80 ? 'text-green-600' : 
                            (cv.ats_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {cv.ats_score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No ATS checks yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CVPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        cv={selectedCV}
        onEdit={handleEditCV}
      />

      <AlertDialog open={!!cvToDelete} onOpenChange={() => setCvToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{cvToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const CVCard = ({ cv, onClick, onDelete }: { cv: CV; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) => {
  const typeLabels: Record<string, string> = {
    scratch: "From Scratch",
    tailored: "Tailored",
    converted: "Converted",
    draft: "Draft",
  };

  return (
    <div 
      className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{cv.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {typeLabels[cv.type] || cv.type}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(cv.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cv.ats_score !== null && (
            <div className={`text-sm font-semibold px-2 py-1 rounded ${
              cv.ats_score >= 80 ? 'bg-green-100 text-green-700' : 
              cv.ats_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {cv.ats_score}% ATS
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

export default Dashboard;
