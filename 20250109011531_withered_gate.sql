/*
  # Initial CareSync Hub Schema

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Stores role and personal details
    - `healthcare_providers`
      - Stores provider information
      - Links to profiles for provider users
    - `patients`
      - Stores patient information
      - Links to profiles for patient users
    - `appointments`
      - Manages healthcare appointments
      - Links patients and providers
    - `billing_records`
      - Tracks medical bills and payments
      - Links to appointments and insurance claims

  2. Security
    - RLS enabled on all tables
    - Policies for data access based on user roles
    - Secure defaults for all tables
*/

-- Profiles table extending auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'provider', 'insurer', 'admin')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Healthcare Providers table
CREATE TABLE healthcare_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialization text NOT NULL,
  npi text UNIQUE NOT NULL,
  address text NOT NULL,
  contact text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  insurance_id text,
  medical_history jsonb DEFAULT '[]'::jsonb,
  primary_care_provider_id uuid REFERENCES healthcare_providers(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  date_time timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing Records table
CREATE TABLE billing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'processed', 'paid', 'denied')),
  service_date date NOT NULL,
  description text NOT NULL,
  insurance_coverage decimal(10,2) DEFAULT 0 CHECK (insurance_coverage >= 0),
  patient_responsibility decimal(10,2) DEFAULT 0 CHECK (patient_responsibility >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Healthcare Providers Policies
CREATE POLICY "Public can view providers"
  ON healthcare_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Providers can update their own record"
  ON healthcare_providers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Patients Policies
CREATE POLICY "Patients can view their own record"
  ON patients FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Providers can view their patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers
      WHERE profile_id = auth.uid()
      AND id = patients.primary_care_provider_id
    )
  );

-- Appointments Policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients WHERE profile_id = auth.uid() AND id = patient_id
    ) OR
    EXISTS (
      SELECT 1 FROM healthcare_providers WHERE profile_id = auth.uid() AND id = provider_id
    )
  );

-- Billing Records Policies
CREATE POLICY "Users can view their billing records"
  ON billing_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients WHERE profile_id = auth.uid() AND id = patient_id
    ) OR
    EXISTS (
      SELECT 1 FROM healthcare_providers WHERE profile_id = auth.uid() AND id = provider_id
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_billing_records_patient_id ON billing_records(patient_id);
CREATE INDEX idx_billing_records_provider_id ON billing_records(provider_id);
CREATE INDEX idx_billing_records_service_date ON billing_records(service_date);