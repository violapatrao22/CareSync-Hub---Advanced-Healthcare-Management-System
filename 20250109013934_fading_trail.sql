/*
  # Update Appointment Policies

  1. Changes
    - Add INSERT policy for appointments table
    - Update existing SELECT policy for better clarity
    - Add indexes for better performance

  2. Security
    - Patients can create and view their own appointments
    - Providers can view appointments where they are the provider
*/

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;

-- Create new appointment policies
CREATE POLICY "Patients can manage their appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.profile_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers
      WHERE healthcare_providers.id = appointments.provider_id
      AND healthcare_providers.profile_id = auth.uid()
    )
  );

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_provider 
  ON appointments(patient_id, provider_id);