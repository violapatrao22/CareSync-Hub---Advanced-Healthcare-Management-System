/*
  # Add trigger for automatic profile creation

  1. Changes
    - Add function to create profile on user signup
    - Add trigger to execute function on user insert
  
  2. Security
    - Function executes with security definer to ensure proper permissions
*/

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, email)
  VALUES (
    NEW.id,
    'patient',  -- Default role for new signups
    '',        -- Empty first name initially
    '',        -- Empty last name initially
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();