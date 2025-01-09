/*
  # Add sample healthcare providers
  
  1. New Data
    - Creates auth users for providers
    - Adds corresponding provider profiles and healthcare provider records
  
  2. Changes
    - Inserts sample providers with proper auth user references
*/

DO $$
DECLARE
  auth_user_1 uuid;
BEGIN
  -- Create first provider
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'sarah.johnson@caresync.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"role":"provider","first_name":"Sarah","last_name":"Johnson"}'::jsonb)
  RETURNING id INTO auth_user_1;

  -- Insert first healthcare provider
  INSERT INTO healthcare_providers (profile_id, name, specialization, npi, address, contact)
  VALUES (auth_user_1, 'Sarah Johnson', 'Cardiology', '1234567890', '123 Medical Center Blvd, Suite 100', '555-0101');

  -- Create second provider
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'michael.chen@caresync.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"role":"provider","first_name":"Michael","last_name":"Chen"}'::jsonb)
  RETURNING id INTO auth_user_1;

  -- Insert second healthcare provider
  INSERT INTO healthcare_providers (profile_id, name, specialization, npi, address, contact)
  VALUES (auth_user_1, 'Michael Chen', 'Family Medicine', '2345678901', '456 Health Park Ave, Suite 200', '555-0102');

  -- Create third provider
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'emily.rodriguez@caresync.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"role":"provider","first_name":"Emily","last_name":"Rodriguez"}'::jsonb)
  RETURNING id INTO auth_user_1;

  -- Insert third healthcare provider
  INSERT INTO healthcare_providers (profile_id, name, specialization, npi, address, contact)
  VALUES (auth_user_1, 'Emily Rodriguez', 'Pediatrics', '3456789012', '789 Care Way, Suite 300', '555-0103');
END $$;