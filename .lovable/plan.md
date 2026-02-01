
# Implementation Plan: Authentication Flow & Dashboard State Management

## Overview
This plan addresses three interconnected issues: email confirmation on signup, proper redirects after authentication, and dashboard states for new vs. existing users. We'll also need to create a database table to store CVs so we can track whether a user is new or existing.

---

## Issue 1: Email Confirmation on Sign Up

### Current Behavior
- Users sign up but may not receive confirmation emails
- The signup code already shows a toast "Check your email to confirm your account!" and redirects to `/login`
- The `emailRedirectTo` is set to `window.location.origin` (the homepage)

### Changes Required

**1.1 Update Email Redirect URL**
- Modify `AuthContext.tsx` to set `emailRedirectTo` to redirect users to `/dashboard` after confirming their email
- The confirmation link from the email should land users on the dashboard

**1.2 Login Page - Handle Unconfirmed Email Error**
- Update `Login.tsx` to show a helpful message when users try to log in with an unconfirmed email
- The current error message "Invalid login credentials" is generic - we'll add clarity

---

## Issue 2: Redirect After Login/Sign Up

### Current Behavior
- Email/password login: Redirects to `/dashboard` (working)
- Google OAuth: Uses `redirect_uri` set to `/dashboard` (working for OAuth flow)
- After email confirmation: Redirects to homepage (should go to dashboard)

### Changes Required

**2.1 Update Auth Context**
- Change `emailRedirectTo` from `window.location.origin` to `${window.location.origin}/dashboard`
- This ensures email confirmation redirects to dashboard

**2.2 Add Auth Redirect Logic**
- Create a new `AuthRedirect.tsx` component that handles OAuth callbacks
- Add redirect logic in `Login.tsx` and `Signup.tsx` to check if user is already authenticated and redirect to dashboard

**2.3 Update Login Page**
- Check if user is already logged in on mount, redirect to dashboard if so
- This handles the case after email confirmation or OAuth return

**2.4 Update Signup Page**  
- Same check - if user is authenticated, redirect to dashboard

---

## Issue 3: Dashboard States (New User vs. Existing User)

### Database Schema Required

**3.1 Create CVs Table**
A new `cvs` table to store user CVs:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| title | text | CV title/name |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| content | jsonb | CV content data |
| ats_score | integer | Latest ATS score (nullable) |
| type | text | Type: 'scratch', 'tailored', 'converted' |

**RLS Policies:**
- Users can only read their own CVs
- Users can only insert/update/delete their own CVs

### Dashboard Updates

**3.2 New User State (Empty State)**
When `cvs.length === 0`:
- Show centered empty state with:
  - Document illustration icon
  - "Nothing to show yet" heading
  - "Jump right into creating your first CV" subtext
  - "Get Started" button that opens a modal with 4 options

**3.3 Existing User State**
When `cvs.length > 0`:
- Show the current dashboard layout with user's CVs
- Add "Create CV" dropdown button at the top with 4 options:
  - Create a CV from Scratch
  - Tailor CV to a Job
  - Convert CV to Country Format
  - ATS Compatibility Check
- Show recent CVs in sidebar with actual data
- Show quick stats with real numbers

**3.4 Create CV Options Dropdown**
- Use the existing shadcn `DropdownMenu` component
- Style with primary color (orange/red)
- Include dropdown arrow icon
- Navigate to respective routes on click

---

## New Routes Required

Add placeholder pages for the CV flows:
- `/create` - Create CV from scratch
- `/tailor` - Tailor CV to a job
- `/convert` - Convert to country format  
- `/ats-check` - ATS compatibility check

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/contexts/AuthContext.tsx` | Modify | Update emailRedirectTo to /dashboard |
| `src/pages/Login.tsx` | Modify | Add auth check, redirect if logged in |
| `src/pages/Signup.tsx` | Modify | Add auth check, redirect if logged in |
| `src/pages/Dashboard.tsx` | Modify | Add CV query, empty state, create dropdown |
| `src/pages/CreateCV.tsx` | Create | Placeholder page for CV creation |
| `src/pages/TailorCV.tsx` | Create | Placeholder page for tailoring |
| `src/pages/ConvertCV.tsx` | Create | Placeholder page for conversion |
| `src/pages/ATSCheck.tsx` | Create | Placeholder page for ATS check |
| `src/App.tsx` | Modify | Add new routes |
| Database migration | Create | Add cvs table with RLS policies |

---

## Technical Details

### Database Migration SQL
```sql
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
```

### Auth Redirect Check Pattern
```typescript
// In Login.tsx and Signup.tsx
useEffect(() => {
  if (user && !loading) {
    navigate('/dashboard', { replace: true });
  }
}, [user, loading, navigate]);
```

### Dashboard CV Query Pattern
```typescript
const [cvs, setCvs] = useState<CV[]>([]);
const [loadingCvs, setLoadingCvs] = useState(true);

useEffect(() => {
  const fetchCvs = async () => {
    if (user) {
      const { data } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      setCvs(data || []);
      setLoadingCvs(false);
    }
  };
  fetchCvs();
}, [user]);
```

### Empty State Component Structure
```text
+------------------------------------------+
|                                          |
|        [Document Icon in circle]         |
|                                          |
|         Nothing to show yet              |
|                                          |
|   Jump right into creating your first CV |
|                                          |
|          [ Get Started ]                 |
|              ↓                           |
|    Opens modal with 4 options            |
+------------------------------------------+
```

### Create CV Dropdown Structure
```text
+------------------------------------------+
|   [+ Create CV ▼]                        |
|   +---------------------------------+    |
|   | Create a CV from Scratch        |    |
|   | Tailor CV to a Job              |    |
|   | Convert CV to Country Format    |    |
|   | ATS Compatibility Check         |    |
|   +---------------------------------+    |
+------------------------------------------+
```

---

## Implementation Order

1. Create database migration for `cvs` table
2. Update `AuthContext.tsx` with correct redirect URL
3. Update `Login.tsx` and `Signup.tsx` with auth checks
4. Create placeholder pages for CV flows
5. Update `App.tsx` with new routes
6. Update `Dashboard.tsx` with CV query and conditional rendering
