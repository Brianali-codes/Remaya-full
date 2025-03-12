-- Add missing columns to blogs table
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS linkedin_handle TEXT,
ADD COLUMN IF NOT EXISTS is_admin_post BOOLEAN DEFAULT false;