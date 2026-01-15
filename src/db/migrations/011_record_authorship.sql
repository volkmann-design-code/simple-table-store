-- Add authorship tracking to records
ALTER TABLE records
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_records_created_by ON records(created_by);
CREATE INDEX idx_records_updated_by ON records(updated_by);
