export type ExperienceLevel = 'no-experience' | 'recent-graduate' | 'experienced';

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentlyStudying: boolean;
  gpa: string;
  coursework: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking: boolean;
  responsibilities: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  date: string;
  description: string;
  link: string;
}

export interface CustomSection {
  id: string;
  name: string;
  content: string;
}

export interface CVFormData {
  experienceLevel: ExperienceLevel;
  // Personal Info
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  // Summary
  summary: string;
  // Education
  education: Education[];
  // Work Experience
  workExperience: WorkExperience[];
  // Skills
  skills: string[];
  // Projects
  projects: Project[];
  // Custom Sections
  customSections: CustomSection[];
}

export interface CountryFormat {
  code: string;
  name: string;
  flag: string;
  notes: string[];
}

export const COUNTRIES: CountryFormat[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', notes: ['Photos often expected', 'Include date of birth'] },
  { code: 'US', name: 'USA', flag: '🇺🇸', notes: ['No photo', 'One page preferred', 'No personal details'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', notes: ['Similar to US format', 'Two pages acceptable'] },
  { code: 'GB', name: 'UK', flag: '🇬🇧', notes: ['Two pages standard', 'No photo needed'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', notes: ['Photo expected', 'Include birthdate', 'Detailed format'] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', notes: ['No photo', 'Concise format', 'Personal number optional'] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', notes: ['No photo', 'Two pages max', 'References on request'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', notes: ['No photo', 'Three pages acceptable', 'Include referees'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', notes: ['Photo common', 'Handwritten letter sometimes expected'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', notes: ['No photo required', 'Keep it concise'] },
];

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Two-column layout with subtle accents' },
  { id: 'classic', name: 'Classic', description: 'Traditional single-column format' },
  { id: 'minimal', name: 'Minimal', description: 'Maximum white space, clean lines' },
  { id: 'executive', name: 'Executive', description: 'Sophisticated and professional' },
  { id: 'creative', name: 'Creative', description: 'Bold design for creative roles' },
  { id: 'technical', name: 'Technical', description: 'Optimized for technical roles' },
];
