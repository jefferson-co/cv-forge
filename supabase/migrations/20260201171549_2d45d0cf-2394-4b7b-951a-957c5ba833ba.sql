-- Create cv_tailoring_jobs table for storing tailored CVs
CREATE TABLE public.cv_tailoring_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  original_cv_file_url TEXT,
  original_cv_content JSONB,
  job_description TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  tailored_cv_content JSONB,
  changes_made JSONB DEFAULT '[]'::jsonb,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  keywords_added TEXT[] DEFAULT '{}',
  selected_country TEXT DEFAULT 'US',
  selected_template TEXT DEFAULT 'modern',
  custom_name TEXT,
  pdf_url TEXT,
  docx_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cv_tailoring_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tailoring jobs" 
ON public.cv_tailoring_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tailoring jobs" 
ON public.cv_tailoring_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tailoring jobs" 
ON public.cv_tailoring_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tailoring jobs" 
ON public.cv_tailoring_jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_cv_tailoring_jobs_user_id ON public.cv_tailoring_jobs(user_id);
CREATE INDEX idx_cv_tailoring_jobs_created_at ON public.cv_tailoring_jobs(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cv_tailoring_jobs_updated_at
BEFORE UPDATE ON public.cv_tailoring_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();