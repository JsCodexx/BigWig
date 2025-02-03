/*
  # Initial Schema Setup for Survey Management System

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - role (enum: admin, surveyor, client)
      - full_name (text)
      - email (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - surveys
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - client_id (uuid, references profiles)
      - surveyor_id (uuid, references profiles)
      - status (enum: pending, assigned, submitted, approved, rejected)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - survey_responses
      - id (uuid, primary key)
      - survey_id (uuid, references surveys)
      - surveyor_id (uuid, references profiles)
      - response_data (jsonb)
      - status (enum: draft, submitted)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - title (text)
      - message (text)
      - read (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for each user role
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'surveyor', 'client');
CREATE TYPE survey_status AS ENUM ('pending', 'assigned', 'submitted', 'approved', 'rejected');
CREATE TYPE response_status AS ENUM ('draft', 'submitted');

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    role user_role NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Create surveys table
CREATE TABLE surveys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    client_id uuid REFERENCES profiles NOT NULL,
    surveyor_id uuid REFERENCES profiles,
    status survey_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE survey_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id uuid REFERENCES surveys NOT NULL,
    surveyor_id uuid REFERENCES profiles NOT NULL,
    response_data jsonb NOT NULL DEFAULT '{}',
    status response_status DEFAULT 'draft',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Surveys policies
CREATE POLICY "Surveys are viewable by involved parties and admins"
    ON surveys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND (
                profiles.role = 'admin'
                OR profiles.id = surveys.client_id
                OR profiles.id = surveys.surveyor_id
            )
        )
    );

CREATE POLICY "Only admins can create surveys"
    ON surveys FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update surveys"
    ON surveys FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Survey responses policies
CREATE POLICY "Responses are viewable by involved parties and admins"
    ON survey_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND (
                profiles.role = 'admin'
                OR profiles.id = survey_responses.surveyor_id
            )
        )
    );

CREATE POLICY "Surveyors can create and update their responses"
    ON survey_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'surveyor'
            AND profiles.id = survey_responses.surveyor_id
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.id = notifications.user_id
        )
    );

CREATE POLICY "Only system can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, role, full_name, email)
    VALUES (
        new.id,
        'client',  -- Default role for new users
        new.raw_user_meta_data->>'full_name',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
    BEFORE UPDATE ON survey_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();