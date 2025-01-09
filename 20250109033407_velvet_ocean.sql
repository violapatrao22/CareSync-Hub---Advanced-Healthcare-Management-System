/*
  # Add chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text, either 'user' or 'bot')
      - `content` (text)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('user', 'bot')),
  content text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can insert their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);