-- Admin policies to bypass RLS for admin operations
-- Admin operations are identified by setting app.is_admin = 'true'

-- Policy: Admin can access all datastores
CREATE POLICY datastores_admin_access ON datastores
  FOR ALL
  USING (
    current_setting('app.is_admin', true) = 'true'
  );

-- Policy: Admin can access all records
CREATE POLICY records_admin_access ON records
  FOR ALL
  USING (
    current_setting('app.is_admin', true) = 'true'
  );

-- Policy: Admin can access all files
CREATE POLICY files_admin_access ON files
  FOR ALL
  USING (
    current_setting('app.is_admin', true) = 'true'
  );
