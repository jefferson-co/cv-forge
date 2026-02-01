import { FileText, Target, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface CVOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const options: CVOption[] = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Create a CV from Scratch",
    description: "Start fresh with a guided form",
    href: "/create-cv",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Tailor CV to a Job",
    description: "Match your CV to a job description",
    href: "/tailor",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Convert CV to Country Format",
    description: "Adapt to country standards",
    href: "/convert",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "ATS Compatibility Check",
    description: "Analyze ATS compatibility",
    href: "/ats-check",
  },
];

export const CVOptionsMenu = () => {
  return (
    <div className="space-y-2 py-2">
      {options.map((option) => (
        <Link
          key={option.href}
          to={option.href}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            {option.icon}
          </div>
          <div>
            <p className="font-medium text-foreground">{option.title}</p>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
