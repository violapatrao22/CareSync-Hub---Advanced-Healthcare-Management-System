/*
  # Fix patient record creation
  
  1. Changes
    - Modify patient creation trigger to handle existing profiles
    - Create patient records for existing patient profiles
    - Add error handling for patient creation
  
  2. Security
    - Maintains existing RLS policies
*/

-- First ensure the trigger function handles errors properly
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
    ON CONFLICT (profile_id) 
    DO UPDATE SET
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error and continue
  RAISE WARNING 'Error creating patient record: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create patient records for any existing patient profiles that don't have one
DO $$
BEGIN
  INSERT INTO public.patients (profile_id, date_of_birth)
  SELECT id, CURRENT_DATE
  FROM profiles
  WHERE role = 'patient'
  AND NOT EXISTS (
    SELECT 1 
    FROM patients 
    WHERE patients.profile_id = profiles.id
  );
END $$;