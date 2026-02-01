import { Users, Target, Sparkles, Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            About Modiq
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to help job seekers land their dream roles by creating 
            professional, ATS-optimized CVs that stand out from the crowd.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                Job searching shouldn't be harder than it needs to be. Too many qualified 
                candidates get overlooked because their CVs don't pass automated screening 
                systems or fail to highlight their true potential.
              </p>
              <p className="text-muted-foreground">
                Modiq combines the power of AI with proven CV best practices to give 
                every job seeker the tools they need to present themselves professionally 
                and confidently.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">10+</div>
                  <div className="text-sm text-muted-foreground">Country Formats</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">1000s</div>
                  <div className="text-sm text-muted-foreground">CVs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Assistance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">What We Believe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ValueCard 
              icon={<Users className="w-5 h-5" />}
              title="Everyone Deserves a Chance"
              description="Your CV should showcase your skills, not limit your opportunities. We level the playing field."
            />
            <ValueCard 
              icon={<Target className="w-5 h-5" />}
              title="Precision Matters"
              description="Every word counts. Our AI tailors your CV to match specific jobs and industries."
            />
            <ValueCard 
              icon={<Sparkles className="w-5 h-5" />}
              title="Innovation First"
              description="We continuously improve our AI to stay ahead of changing hiring trends and ATS systems."
            />
            <ValueCard 
              icon={<Heart className="w-5 h-5" />}
              title="User-Centric Design"
              description="Simple, intuitive, and effective. We build tools that work the way you expect."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <a 
            href="mailto:hello@modiq.app" 
            className="text-primary hover:underline font-medium"
          >
            hello@modiq.app
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const ValueCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="bg-background rounded-xl p-6 border border-border">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default About;
