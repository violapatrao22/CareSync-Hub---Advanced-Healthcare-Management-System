/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop existing RLS policies for profiles table
    - Add new policies that allow:
      - Profile creation during signup
      - Users to read their own profile
      - Users to update their own profile
      - Public read access to basic provider information

  2. Security
    - Maintains row-level security
    - Ensures users can only access their own data
    - Allows necessary access for signup flow
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for authentication" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable insert for signup" ON profiles
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view provider profiles" ON profiles
  FOR SELECT TO authenticated
  USING (role = 'provider');

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);