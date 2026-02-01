import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CVOptionsMenu } from "./CVOptionsMenu";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Nothing to show yet</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Jump right into creating your first CV
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="accent" size="lg">
            Get Started
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an option</DialogTitle>
          </DialogHeader>
          <CVOptionsMenu />
        </DialogContent>
      </Dialog>
    </div>
  );
};
