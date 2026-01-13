-- Enable Row Level Security on tables
ALTER TABLE datastores ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Force RLS for all users except superuser
ALTER TABLE datastores FORCE ROW LEVEL SECURITY;
ALTER TABLE records FORCE ROW LEVEL SECURITY;

-- Policy: Users can access datastores in their organization
CREATE POLICY datastores_user_access ON datastores
  FOR ALL
  USING (
    org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
  );

-- Policy: Users can access records in datastores of their organization
CREATE POLICY records_user_access ON records
  FOR ALL
  USING (
    datastore_id IN (
      SELECT id FROM datastores 
      WHERE org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
    )
  );
