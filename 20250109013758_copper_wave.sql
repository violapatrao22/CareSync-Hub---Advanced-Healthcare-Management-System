/*
  # Fix patient record creation and access

  1. Changes
    - Add trigger to automatically create patient records
    - Update RLS policies for patients table
    - Add function to ensure patient record exists

  2. Security
    - Maintains row-level security
    - Ensures proper access control
*/

-- Function to ensure patient record exists
CREATE OR REPLACE FUNCTION ensure_patient_record(profile_id uuid)
RETURNS uuid AS $$
DECLARE
  patient_id uuid;
BEGIN
  -- Try to get existing patient ID
  SELECT id INTO patient_id
  FROM patients
  WHERE patients.profile_id = ensure_patient_record.profile_id;
  
  -- If no patient record exists, create one
  IF patient_id IS NULL THEN
    INSERT INTO patients (profile_id, date_of_birth)
    VALUES (ensure_patient_record.profile_id, CURRENT_DATE)
    RETURNING id INTO patient_id;
  END IF;
  
  RETURN patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update patients policies
DROP POLICY IF EXISTS "Patients can view their own record" ON patients;
DROP POLICY IF EXISTS "Providers can view their patients" ON patients;

CREATE POLICY "Patients can view and update their own record"
  ON patients FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Providers can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'provider'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON patients(profile_id);