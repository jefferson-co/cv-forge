import { ArrowRight, Codepen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number; pulseSpeed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15 - 0.05,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.008 + 0.003,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      }

      // Draw faint connections for nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const lineOpacity = (1 - dist / 100) * 0.04;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen surface-dark relative overflow-hidden">
      {/* Particle canvas */}
      <ParticleBackground />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid dot-grid-fade pointer-events-none" />
      
      {/* Subtle radial glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-16 animate-fade-up opacity-0 stagger-1">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Codepen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-[hsl(var(--surface-dark-foreground))] font-display">
              Modiq
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[hsl(var(--surface-dark-foreground))] tracking-tight leading-[1.08] mb-6 font-display animate-fade-up opacity-0 stagger-2">
            Build Job-Winning
            <br />
            <span className="text-primary">CVs</span> in Minutes
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[hsl(var(--surface-dark-muted))] max-w-md mx-auto mb-12 animate-fade-up opacity-0 stagger-3">
            AI-powered CV builder that helps you land more interviews.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 stagger-4">
            <Link to="/signup">
              <Button size="lg" className="min-w-[160px] gap-2 shadow-glow text-base h-12">
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[160px] text-base h-12 border-[hsl(0_0%_25%)] text-[hsl(var(--surface-dark-foreground))] hover:bg-[hsl(0_0%_12%)] bg-transparent"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
