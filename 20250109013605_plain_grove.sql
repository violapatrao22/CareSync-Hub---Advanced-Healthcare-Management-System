-- Ensure profiles table has proper indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    email
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = now();

  -- Create patient record if needed
  IF (COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'patient') THEN
    INSERT INTO public.patients (profile_id, date_of_birth)
    VALUES (NEW.id, CURRENT_DATE)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error and continue
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;