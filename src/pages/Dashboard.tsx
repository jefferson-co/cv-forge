import { useState, useEffect } from "react";
import { Codepen, LogOut, User, ChevronDown, BarChart3, Clock, Calendar, Trash2, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Codepen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground font-display">Modiq</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {hasNoCvs ? (
            <EmptyState />
          ) : (
            <>
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Dashboard</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display">
                    Welcome back, {firstName}
                  </h1>
                </div>
                <CreateCVDropdown />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <StatCard
                  icon={<FileText className="w-4 h-4" />}
                  label="CVs this month"
                  value={cvsThisMonth.toString()}
                  accent={false}
                />
                <StatCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Avg. ATS score"
                  value={avgAtsScore !== null ? `${avgAtsScore}%` : "—"}
                  accent={avgAtsScore !== null && avgAtsScore >= 75}
                />
                <StatCard
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Jobs tailored"
                  value={tailoredCount.toString()}
                  accent={false}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* CV List */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-foreground font-display">Your CVs</h2>
                    <span className="text-xs text-muted-foreground">{cvs.length} total</span>
                  </div>
                  <div className="space-y-3">
                    {cvs.slice(0, 5).map((cv, i) => (
                      <CVCard
                        key={cv.id}
                        cv={cv}
                        onClick={() => handleCVClick(cv)}
                        onDelete={(e) => handleDeleteClick(e, cv)}
                        index={i}
                      />
                    ))}
                  </div>
                  {cvs.length > 5 && (
                    <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
                      View all {cvs.length} CVs
                    </Button>
                  )}
                </div>

                {/* ATS Sidebar */}
                <div>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2 font-display">
                      <Clock className="w-4 h-4 text-primary" />
                      ATS Score History
                    </h3>
                    {cvs.filter(cv => cv.ats_score !== null).length > 0 ? (
                      <div className="space-y-4">
                        {cvs.filter(cv => cv.ats_score !== null).slice(0, 4).map((cv) => (
                          <div key={cv.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground truncate">{cv.title}</span>
                            <ATSBadge score={cv.ats_score || 0} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                          <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No ATS checks yet</p>
                        <Link to="/ats-check">
                          <Button variant="ghost" size="sm" className="mt-3 text-primary">
                            Run your first check
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
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

/* ---------- Subcomponents ---------- */

const StatCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: boolean;
}) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-bold font-display ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const ATSBadge = ({ score }: { score: number }) => {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 60
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {score}%
    </span>
  );
};

const CVCard = ({
  cv,
  onClick,
  onDelete,
  index,
}: {
  cv: CV;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  index: number;
}) => {
  const typeLabels: Record<string, string> = {
    scratch: "From Scratch",
    tailored: "Tailored",
    converted: "Converted",
    draft: "Draft",
  };

  return (
    <div
      className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "forwards" }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-200">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{cv.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {typeLabels[cv.type] || cv.type}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(cv.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {cv.ats_score !== null && <ATSBadge score={cv.ats_score} />}
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-secondary/30">
    {/* Nav skeleton */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
        <Skeleton className="w-32 h-8 rounded-md" />
      </div>
    </nav>

    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <Skeleton className="w-20 h-4 rounded mb-2" />
            <Skeleton className="w-64 h-9 rounded" />
          </div>
          <Skeleton className="w-36 h-11 rounded-md" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5">
              <Skeleton className="w-8 h-8 rounded-lg mb-3" />
              <Skeleton className="w-16 h-7 rounded mb-1" />
              <Skeleton className="w-24 h-3 rounded" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CV list skeleton */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="w-24 h-5 rounded" />
              <Skeleton className="w-12 h-3 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="w-40 h-5 rounded mb-2" />
                    <div className="flex gap-3">
                      <Skeleton className="w-20 h-4 rounded-full" />
                      <Skeleton className="w-24 h-4 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-14 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <Skeleton className="w-32 h-4 rounded mb-5" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="w-28 h-4 rounded" />
                    <Skeleton className="w-10 h-4 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Dashboard;
