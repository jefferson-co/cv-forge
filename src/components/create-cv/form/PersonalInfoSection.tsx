import { useState } from "react";
import { useCVForm } from "@/contexts/CVFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PersonalInfoSection = () => {
  const { formData, updateField } = useCVForm();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv-photos')
        .getPublicUrl(fileName);

      updateField('photoUrl', publicUrl);
      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    updateField('photoUrl', '');
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Basic details for your CV header</p>
      </div>

      {/* CV Title */}
      <div className="space-y-2">
        <Label htmlFor="cvTitle">CV Title (for your reference)</Label>
        <Input
          id="cvTitle"
          placeholder="e.g., Software Engineer CV, Marketing Resume"
          value={formData.cvTitle}
          onChange={(e) => updateField('cvTitle', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">This helps you identify this CV in your dashboard</p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Profile Photo (Optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">Some countries require a photo on CVs (e.g., Germany, France)</p>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {formData.photoUrl ? (
              <AvatarImage src={formData.photoUrl} alt="Profile photo" />
            ) : (
              <AvatarFallback className="bg-secondary">
                <User className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            {formData.photoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
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
