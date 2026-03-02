import { FileText, Pencil, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CVFormData } from "@/types/cv";

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: {
    id: string;
    title: string;
    content: CVFormData | null;
    type: string;
    created_at: string;
  } | null;
  onEdit: (cvId: string) => void;
}

export const CVPreviewModal = ({ isOpen, onClose, cv, onEdit }: CVPreviewModalProps) => {
  if (!cv || !cv.content) return null;

  const content = cv.content;
  const selectedCountry = (content as any).selectedCountry || 'US';
  const photoCountries = ['DE', 'FR'];
  const shouldShowPhoto = photoCountries.includes(selectedCountry) && content.photoUrl;

  const generatePreviewContent = () => {
    return `${content.fullName || 'Name not provided'}
${content.professionalTitle || ''}
${[content.email, content.phone, content.location].filter(Boolean).join(' | ')}
${content.linkedinUrl ? `LinkedIn: ${content.linkedinUrl}` : ''}
${content.portfolioUrl ? `Portfolio: ${content.portfolioUrl}` : ''}

PROFESSIONAL SUMMARY
${content.summary || 'No summary provided'}

EDUCATION
${content.education?.length > 0 
  ? content.education.map(e => 
      `${e.degree}
${e.institution}${e.location ? `, ${e.location}` : ''}
${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate}
${e.gpa ? `GPA: ${e.gpa}` : ''}
${e.coursework ? `Relevant Coursework: ${e.coursework}` : ''}`
    ).join('\n\n')
  : 'No education entries'}

${content.workExperience?.length > 0 ? `WORK EXPERIENCE
${content.workExperience.map(w => 
  `${w.jobTitle}
${w.company}${w.location ? `, ${w.location}` : ''}
${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate}
${w.responsibilities}`
).join('\n\n')}` : ''}

SKILLS
${content.skills?.length > 0 ? content.skills.join(' • ') : 'No skills listed'}

${content.projects?.length > 0 ? `PROJECTS
${content.projects.map(p => 
  `${p.title}${p.role ? ` - ${p.role}` : ''}${p.date ? ` (${p.date})` : ''}
${p.description}
${p.link ? `Link: ${p.link}` : ''}`
).join('\n\n')}` : ''}

${content.customSections?.length > 0 
  ? content.customSections.map(s => `${s.name.toUpperCase()}\n${s.content}`).join('\n\n')
  : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {cv.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="bg-white text-gray-900 border rounded-lg p-8 font-mono text-sm whitespace-pre-wrap">
            {/* Show photo for countries that expect it */}
            {shouldShowPhoto && (
              <div className="flex justify-end mb-4">
                <img 
                  src={content.photoUrl} 
                  alt="Profile" 
                  className="w-24 h-32 object-cover border rounded"
                />
              </div>
            )}
            {generatePreviewContent()}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(cv.id)} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit CV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
