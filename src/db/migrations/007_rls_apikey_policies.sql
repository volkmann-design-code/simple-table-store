-- Policy: API keys can read records from their associated datastore only
CREATE POLICY records_apikey_read ON records
  FOR SELECT
  USING (
    datastore_id = NULLIF(current_setting('app.current_api_key_datastore_id', true), '')::uuid
  );

-- Policy: API keys can read datastore metadata for their associated datastore
CREATE POLICY datastores_apikey_read ON datastores
  FOR SELECT
  USING (
    id = NULLIF(current_setting('app.current_api_key_datastore_id', true), '')::uuid
  );
