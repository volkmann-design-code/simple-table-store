## 1. Implementation
- [x] 1.1 Add i18n strings for org view (en.lang.ts, de.lang.ts)
- [x] 1.2 Create OrgPage.tsx component with org metadata display
- [x] 1.3 Add member table to OrgPage.tsx showing all org users
- [x] 1.4 Add read-only notice about admin-only changes
- [x] 1.5 Add route handler in views.tsx for GET `/org`
- [x] 1.6 Implement access control: verify user has org_id, redirect if not
- [x] 1.7 Query organization data and members using withUserContext
- [x] 1.8 Add navigation link to org view in Layout or DashboardPage

## 2. Validation
- [ ] 2.1 Test accessing `/org` with valid session and org membership
- [ ] 2.2 Test redirect behavior if user has no org_id (edge case)
- [ ] 2.3 Verify org metadata displays correctly
- [ ] 2.4 Verify member table shows all users in the organization
- [ ] 2.5 Verify read-only notice is visible
- [ ] 2.6 Test i18n strings render correctly in both languages
