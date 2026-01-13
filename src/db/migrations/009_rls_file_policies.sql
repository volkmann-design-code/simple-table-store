-- Enable Row Level Security on files table
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE files FORCE ROW LEVEL SECURITY;

-- Policy: Users can access files in datastores of their organization
CREATE POLICY files_user_access ON files
  FOR ALL
  USING (
    datastore_id IN (
      SELECT id FROM datastores 
      WHERE org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
    )
  );

-- Policy: API keys can read files from their associated datastore only
CREATE POLICY files_apikey_read ON files
  FOR SELECT
  USING (
    datastore_id = NULLIF(current_setting('app.current_api_key_datastore_id', true), '')::uuid
  );
