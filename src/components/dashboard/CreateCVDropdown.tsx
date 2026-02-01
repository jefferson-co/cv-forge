import { Plus, ChevronDown, FileText, Target, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export const CreateCVDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="accent" size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create CV
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/create-cv" className="flex items-center gap-3 py-2">
            <FileText className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium">Create from Scratch</p>
              <p className="text-xs text-muted-foreground">Start with a guided form</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/tailor" className="flex items-center gap-3 py-2">
            <Target className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium">Tailor to Job</p>
              <p className="text-xs text-muted-foreground">Match to job description</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/convert" className="flex items-center gap-3 py-2">
            <Globe className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium">Convert Format</p>
              <p className="text-xs text-muted-foreground">Adapt to country standards</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/ats-check" className="flex items-center gap-3 py-2">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium">ATS Check</p>
              <p className="text-xs text-muted-foreground">Analyze compatibility</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
