-- Add cache_duration_seconds column to datastores table
ALTER TABLE datastores
ADD COLUMN cache_duration_seconds INTEGER DEFAULT NULL;

-- Add constraint to limit maximum cache duration to 1 year (31536000 seconds)
ALTER TABLE datastores
ADD CONSTRAINT cache_duration_max CHECK (cache_duration_seconds IS NULL OR (cache_duration_seconds >= 0 AND cache_duration_seconds <= 31536000));
