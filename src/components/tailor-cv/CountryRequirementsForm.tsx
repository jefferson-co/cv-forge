import { useState, useRef } from 'react';
import { Camera, Calendar, Flag, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CountryRequirementsFormProps {
  requiresPhoto: boolean;
  requiresDOB: boolean;
  countryName: string;
  currentPhotoUrl?: string;
  currentDOB?: string;
  currentNationality?: string;
  onPhotoChange: (url: string) => void;
  onDOBChange: (dob: string) => void;
  onNationalityChange: (nationality: string) => void;
}

const CountryRequirementsForm = ({
  requiresPhoto,
  requiresDOB,
  countryName,
  currentPhotoUrl,
  currentDOB,
  currentNationality,
  onPhotoChange,
  onDOBChange,
  onNationalityChange,
}: CountryRequirementsFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv-photos')
        .getPublicUrl(fileName);

      onPhotoChange(publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!requiresPhoto && !requiresDOB) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Flag className="w-4 h-4 text-primary" />
          Required for {countryName} CVs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Upload */}
        {requiresPhoto && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Professional Photo
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              {currentPhotoUrl ? (
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={currentPhotoUrl} alt="Profile photo" />
                    <AvatarFallback>Photo</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemovePhoto}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a professional headshot. The photo will appear on your CV.
            </p>
          </div>
        )}

        {/* Date of Birth */}
        {requiresDOB && (
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date of Birth
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dob"
              type="date"
              value={currentDOB || ''}
              onChange={(e) => onDOBChange(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        )}

        {/* Nationality */}
        {requiresDOB && (
          <div className="space-y-2">
            <Label htmlFor="nationality" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Nationality
            </Label>
            <Input
              id="nationality"
              type="text"
              placeholder="e.g., Nigerian, German, French"
              value={currentNationality || ''}
              onChange={(e) => onNationalityChange(e.target.value)}
              className="max-w-[250px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryRequirementsForm;
