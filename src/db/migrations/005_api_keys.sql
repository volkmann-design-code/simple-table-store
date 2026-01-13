-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datastore_id UUID NOT NULL REFERENCES datastores(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_datastore_id ON api_keys(datastore_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
