-- Create cvs table
CREATE TABLE public.cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled CV',
  content JSONB DEFAULT '{}',
  type TEXT DEFAULT 'scratch',
  ats_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own CVs" 
  ON public.cvs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs" 
  ON public.cvs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs" 
  ON public.cvs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs" 
  ON public.cvs FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();