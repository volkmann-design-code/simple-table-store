-- Files table for storing file metadata and S3 object references
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datastore_id UUID NOT NULL REFERENCES datastores(id) ON DELETE CASCADE,
  object_key VARCHAR(512) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_files_datastore_id ON files(datastore_id);
CREATE INDEX idx_files_object_key ON files(object_key);
