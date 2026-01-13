-- Records table
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datastore_id UUID NOT NULL REFERENCES datastores(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_records_datastore_id ON records(datastore_id);
CREATE INDEX idx_records_data ON records USING GIN(data);
