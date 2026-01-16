-- Add allowed_cors_origins column to datastores table
ALTER TABLE datastores
ADD COLUMN allowed_cors_origins TEXT DEFAULT NULL;
