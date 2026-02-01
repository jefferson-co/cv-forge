import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { ExperienceLevel } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ExperienceLevelCard from "@/components/create-cv/ExperienceLevelCard";

const ExperienceLevelPage = () => {
  const navigate = useNavigate();
  const { updateField } = useCVForm();

  const handleSelect = (level: ExperienceLevel) => {
    updateField('experienceLevel', level);
    navigate('/create-cv/form');
  };

  return (
    <CreateCVLayout backTo="/dashboard">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-3">Let's build your CV</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          First, tell us about your experience level so we can guide you better
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <ExperienceLevelCard
          icon={GraduationCap}
          title="No Experience"
          description="I'm just starting out or looking for my first job"
          onClick={() => handleSelect('no-experience')}
        />
        <ExperienceLevelCard
          icon={BookOpen}
          title="Recent Graduate"
          description="I recently graduated and have some internships or projects"
          onClick={() => handleSelect('recent-graduate')}
        />
        <ExperienceLevelCard
          icon={Briefcase}
          title="Experienced Professional"
          description="I have multiple years of work experience"
          onClick={() => handleSelect('experienced')}
        />
      </div>
    </CreateCVLayout>
  );
};

export default ExperienceLevelPage;
