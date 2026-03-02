import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
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

  const cards = [
    { icon: GraduationCap, title: "No Experience", description: "I'm just starting out or looking for my first job", level: 'no-experience' as ExperienceLevel },
    { icon: BookOpen, title: "Recent Graduate", description: "I recently graduated and have some internships or projects", level: 'recent-graduate' as ExperienceLevel },
    { icon: Briefcase, title: "Experienced Professional", description: "I have multiple years of work experience", level: 'experienced' as ExperienceLevel },
  ];

  return (
    <CreateCVLayout backTo="/dashboard">
      <motion.div 
        className="text-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Let's build your CV</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
          First, tell us about your experience level so we can guide you better
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cards.map((card, i) => (
          <motion.div
            key={card.level}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: "easeOut" }}
          >
            <ExperienceLevelCard
              icon={card.icon}
              title={card.title}
              description={card.description}
              onClick={() => handleSelect(card.level)}
            />
          </motion.div>
        ))}
      </div>
    </CreateCVLayout>
  );
};

export default ExperienceLevelPage;
