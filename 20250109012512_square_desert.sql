-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role text;
  default_first_name text;
  default_last_name text;
BEGIN
  -- Set default values
  default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  default_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  default_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    email
  )
  VALUES (
    NEW.id,
    default_role,
    default_first_name,
    default_last_name,
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();