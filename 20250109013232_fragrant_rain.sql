/*
  # Add sample healthcare providers
  
  1. New Data
    - Adds several sample healthcare providers with different specializations
    - Creates corresponding profile entries for each provider
  
  2. Changes
    - Inserts sample profiles and providers
*/

-- Insert sample provider profiles
INSERT INTO profiles (id, role, first_name, last_name, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'provider', 'Sarah', 'Johnson', 'sarah.johnson@caresync.com'),
  ('22222222-2222-2222-2222-222222222222', 'provider', 'Michael', 'Chen', 'michael.chen@caresync.com'),
  ('33333333-3333-3333-3333-333333333333', 'provider', 'Emily', 'Rodriguez', 'emily.rodriguez@caresync.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample healthcare providers
INSERT INTO healthcare_providers (id, profile_id, name, specialization, npi, address, contact)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'Cardiology', '1234567890', '123 Medical Center Blvd, Suite 100', '555-0101'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Michael Chen', 'Family Medicine', '2345678901', '456 Health Park Ave, Suite 200', '555-0102'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Emily Rodriguez', 'Pediatrics', '3456789012', '789 Care Way, Suite 300', '555-0103')
ON CONFLICT (id) DO NOTHING;