import { FileText, Target, Globe, Shield, ArrowRight, Sparkles, CheckCircle, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Landing = () => {
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between bg-white text-black border-none shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#a82d00] text-white">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="accent" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-white text-black">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border mb-8 bg-[#212121] text-[#f90606]">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-serif font-thin text-xs text-white">AI-powered CV optimization</span>
            </div>
            
            <h1 className="text-display-lg mb-6 text-balance text-[#121212] font-serif text-center font-semibold">
              Craft CVs that land
              <span className="text-[#a82d00] font-serif text-center font-semibold"> interviews</span>
            </h1>
            
            <p className="max-w-2xl mx-auto mb-10 text-[#808080] font-sans text-body font-normal">
              Create ATS-optimized CVs tailored to specific jobs and countries. 
              Full transparency, complete control, professional results.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Start Building Your CV
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-secondary" size="xl">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-heading-lg font-bold text-foreground mb-4">
              Four powerful ways to perfect your CV
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're starting fresh or optimizing an existing CV, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard icon={<FileText className="w-6 h-6" />} title="Create from Scratch" description="Guided form adapts to your experience level. AI generates a polished CV from your inputs." features={["Dynamic questions by experience", "AI-powered generation", "Multiple templates"]} />
            <FeatureCard icon={<Target className="w-6 h-6" />} title="Tailor to Job" description="Upload your CV and paste a job description. See exactly what changes were made and why." features={["Side-by-side comparison", "Highlighted changes", "Keyword optimization"]} />
            <FeatureCard icon={<Globe className="w-6 h-6" />} title="Country Format" description="Convert your CV to match specific country standards. Structure, sections, and length adjusted." features={["Country-specific rules", "Professional templates", "One-click conversion"]} />
            <FeatureCard icon={<Shield className="w-6 h-6" />} title="ATS Check" description="Get a detailed breakdown of how your CV performs against ATS systems." features={["Compatibility score", "Keyword gaps", "Section-level feedback"]} />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-heading-lg font-bold text-foreground mb-4">
              Simple, transparent, effective
            </h2>
            <p className="text-body-lg text-muted-foreground">
              No hidden changes. No guesswork. Just better CVs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProcessStep step="01" title="Input" description="Fill in your details or upload your existing CV along with a job description." icon={<Upload className="w-5 h-5" />} />
            <ProcessStep step="02" title="Optimize" description="AI suggests improvements with full explanations. You approve every change." icon={<Sparkles className="w-5 h-5" />} />
            <ProcessStep step="03" title="Export" description="Download your polished CV in PDF or Word format, ready to submit." icon={<Download className="w-5 h-5" />} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-hero rounded-2xl p-12 text-center">
            <h2 className="text-heading-lg font-bold text-primary-foreground mb-4">
              Ready to get more interviews?
            </h2>
            <p className="text-body-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who've improved their CVs with CVCraft.
            </p>
            <Link to="/signup">
              <Button variant="hero" size="xl" className="bg-[#A62C00] hover:bg-[#A62C00]/90 text-white">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-heading-sm font-semibold">CVCraft</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              © 2026 CVCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description,
  features
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) => <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-6">
      {icon}
    </div>
    <h3 className="text-heading-sm font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-body text-muted-foreground mb-6">{description}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => <li key={index} className="flex items-center gap-2 text-body-sm text-foreground">
          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
          {feature}
        </li>)}
    </ul>
  </div>;
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
}) => <div className="text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-6">
      {icon}
    </div>
    <div className="text-caption font-semibold text-accent mb-2">{step}</div>
    <h3 className="text-heading-sm font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-body text-muted-foreground">{description}</p>
  </div>;
export default Landing;