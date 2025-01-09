/*
  # Add patient record creation trigger
  
  1. New Function
    - Creates a patient record when a new profile is created with role 'patient'
  
  2. Changes
    - Adds trigger on profiles table
    - Automatically creates patient record for new patient profiles
*/

-- Function to create patient record
CREATE OR REPLACE FUNCTION public.handle_new_patient_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create patient record if the profile is for a patient
  IF NEW.role = 'patient' THEN
    INSERT INTO public.patients (
      profile_id,
      date_of_birth
    )
    VALUES (
      NEW.id,
      CURRENT_DATE -- Default to current date, can be updated later
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for patient creation
CREATE TRIGGER on_patient_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_patient_profile();