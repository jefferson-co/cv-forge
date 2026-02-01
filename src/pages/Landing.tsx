import { ArrowRight, Sparkles, CheckCircle, Upload, Download, Zap, BarChart3, FileCheck, Layout, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-powered CV optimization</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
              Build Job-Winning CVs
              <br />
              <span className="text-primary">in Minutes</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Create ATS-optimized, professionally formatted CVs tailored to specific jobs and countries. 
              AI-powered analysis gives you the edge you need to land more interviews.
            </p>
            
            <div className="flex items-center justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Build New CV
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to stand out
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create the perfect CV for any opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Target className="w-5 h-5" />} title="AI-Powered Job Tailoring" description="Automatically optimize your CV for specific job descriptions with intelligent keyword matching." />
            <FeatureCard icon={<Globe className="w-5 h-5" />} title="10+ Country Formats" description="Convert your CV to match local standards for US, UK, Germany, France, and more." />
            <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="ATS Scoring & Feedback" description="Get detailed compatibility scores and actionable suggestions to pass ATS filters." />
            <FeatureCard icon={<FileCheck className="w-5 h-5" />} title="Side-by-Side Comparison" description="See exactly what changes were made with highlighted before/after comparisons." />
            <FeatureCard icon={<Layout className="w-5 h-5" />} title="Professional Templates" description="Choose from carefully designed templates that recruiters love." />
            <FeatureCard icon={<Zap className="w-5 h-5" />} title="Instant Generation" description="Generate a complete, polished CV in seconds with our AI engine." />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to your perfect CV
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep step="01" title="Upload or Build" description="Start with an existing CV or create one from scratch." icon={<Upload className="w-5 h-5" />} />
            <ProcessStep step="02" title="AI Analysis" description="Our AI analyzes your content and the target job." icon={<Sparkles className="w-5 h-5" />} />
            <ProcessStep step="03" title="Review & Customize" description="See suggestions and approve changes with full control." icon={<CheckCircle className="w-5 h-5" />} />
            <ProcessStep step="04" title="Download" description="Export your polished CV in PDF or Word format." icon={<Download className="w-5 h-5" />} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to land more interviews?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who've improved their CVs and advanced their careers with Modiq.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-background rounded-xl p-6 border border-border hover:shadow-md transition-shadow duration-300">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const ProcessStep = ({
  step,
  title,
  description,
  icon
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <div className="text-xs font-semibold text-primary mb-2">{step}</div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
