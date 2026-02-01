import { useCVForm } from "@/contexts/CVFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PersonalInfoSection = () => {
  const { formData, updateField } = useCVForm();

  const getTitlePlaceholder = () => {
    switch (formData.experienceLevel) {
      case 'no-experience':
        return 'e.g., Aspiring Software Developer';
      case 'recent-graduate':
        return 'e.g., Junior Data Analyst';
      case 'experienced':
        return 'e.g., Senior Product Manager';
      default:
        return 'Your desired role';
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Basic details for your CV header</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title / Desired Role *</Label>
          <Input
            id="professionalTitle"
            placeholder={getTitlePlaceholder()}
            value={formData.professionalTitle}
            onChange={(e) => updateField('professionalTitle', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/johndoe"
            value={formData.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="portfolioUrl">Portfolio / Website</Label>
          <Input
            id="portfolioUrl"
            type="url"
            placeholder="https://johndoe.com"
            value={formData.portfolioUrl}
            onChange={(e) => updateField('portfolioUrl', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoSection;
