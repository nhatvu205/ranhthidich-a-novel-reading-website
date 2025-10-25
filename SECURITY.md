# 🔒 Security Policy & Guidelines

## ⚠️ CẢNH BÁO BẢO MẬT

### Credentials đã bị lộ
Repository này đã từng commit credentials Supabase vào file `env.txt`. Những credentials này đã bị public và **KHÔNG AN TOÀN** để sử dụng.

**Hành động đã thực hiện:**
- ✅ Xóa file `env.txt`
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Tạo `.env.example` làm template
- ✅ Cảnh báo trong DEPLOYMENT.md

**Hành động BẮT BUỘC trước khi deploy:**
- 🔴 TẠO PROJECT SUPABASE MỚI với credentials mới
- 🔴 KHÔNG sử dụng credentials cũ cho bất kỳ mục đích gì

---

## Reported Security Issues

### Issue 1: Exposed Supabase Credentials (CRITICAL)
**Status:** ⚠️ Mitigated (require new project)  
**Reported:** 2025-10-23  
**Severity:** Critical  

**Details:**
- File `env.txt` chứa Supabase URL và API keys được commit vào git
- Bất kỳ ai clone repo đều có thể truy cập database
- Project ID: `ekgoemuzaoeljugpkrke` - KHÔNG an toàn

**Mitigation:**
- Credentials cũ không được sử dụng nữa
- Hướng dẫn tạo project mới trong DEPLOYMENT.md
- File `.gitignore` đã được cấu hình đúng

**Prevention:**
- Pre-commit hooks sẽ được thêm để scan secrets
- CI/CD checks cho leaked credentials

---

## Security Architecture

### 1. Authentication & Authorization

#### Supabase Auth
- Email/password authentication
- Row Level Security (RLS) enforced
- JWT tokens với automatic refresh
- Session management qua localStorage

#### Role-Based Access Control
```
User Role Hierarchy:
- admin: Full access to all resources
- user: Read-only access to public content
```

**Admin Protection:**
- Middleware check trên server-side (RLS policies)
- Client-side ProtectedRoute component
- Admin bootstrap function với safeguards

### 2. Database Security

#### Row Level Security Policies

**Profiles Table:**
```sql
-- Users can only view/update own profile
-- Admins can view all profiles
```

**User Roles Table:**
```sql
-- Users can view own roles
-- Admins can assign/revoke roles (except their own admin)
```

**Novels & Chapters:**
```sql
-- Public read access
-- Admin-only write access
```

**Audit Log:**
```sql
-- Admin-only read access
-- Auto-populated by triggers
```

#### Database Indexes
- Optimized queries với indexes
- Prevent DoS qua slow queries

### 3. Input Validation

**Client-side:**
- Zod schema validation
- React Hook Form validation
- Type safety với TypeScript

**Server-side:**
- RLS policies validate ownership
- Constraints trên database level
- Triggers validate business logic

### 4. API Security

**Rate Limiting:**
- Supabase built-in rate limiting
- Per-user request limits
- IP-based limits

**CORS:**
- Configured in Supabase Dashboard
- Only allow production domains

### 5. Storage Security

**Buckets:**
- `novel-covers`: Public read, admin write
- `user-avatars`: Public read, user write (own only)

**Policies:**
- File size limits
- MIME type validation
- User isolation (users/[uid]/ folder structure)

---

## Security Best Practices

### For Developers

#### Environment Variables
```bash
# ✅ GOOD
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

# ❌ BAD
VITE_SUPABASE_SERVICE_ROLE_KEY=...  # NEVER in frontend
```

#### API Keys
- ✅ Use `anon` key for frontend
- ❌ NEVER use `service_role` key in client code
- ❌ NEVER commit `.env` files
- ✅ Use environment variables on deployment platforms

#### Code Review Checklist
- [ ] No hardcoded secrets
- [ ] RLS policies enabled
- [ ] Input validated
- [ ] Error messages don't leak sensitive info
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React auto-escapes)

### For Administrators

#### Initial Setup
1. Create new Supabase project
2. Run all migrations
3. Enable email confirmation
4. Set up rate limiting
5. Bootstrap first admin user
6. Test all permissions

#### Regular Maintenance
- Review audit logs weekly
- Check for suspicious activity
- Update dependencies monthly
- Backup database weekly
- Monitor error rates

#### User Management
- Verify email before activating accounts
- Review admin assignments
- Disable inactive accounts
- Implement 2FA (future)

---

## Incident Response Plan

### If credentials leaked:

1. **Immediate:**
   - Revoke exposed API keys in Supabase Dashboard
   - Generate new credentials
   - Update all deployments

2. **Short-term:**
   - Review audit logs for unauthorized access
   - Check for data exfiltration
   - Notify affected users if needed

3. **Long-term:**
   - Implement secret scanning
   - Add pre-commit hooks
   - Train team on security

### If unauthorized access detected:

1. **Immediate:**
   - Lock affected accounts
   - Review RLS policies
   - Check audit logs

2. **Investigation:**
   - Identify attack vector
   - Assess damage
   - Document timeline

3. **Remediation:**
   - Fix vulnerability
   - Update policies
   - Notify users if data compromised

---

## Vulnerability Reporting

### How to Report

**DO:**
- Email: [your-security-email@domain.com]
- Provide detailed steps to reproduce
- Give us reasonable time to fix (90 days)

**DON'T:**
- Don't publicly disclose before fix
- Don't exploit for personal gain
- Don't test on production without permission

### What to Include

1. Description of vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)
5. Your contact info (for updates)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 1 week
- **Fix for critical issues:** Within 2 weeks
- **Fix for medium issues:** Within 1 month
- **Public disclosure:** After fix + 30 days

---

## Security Audits

### Planned Audits

- [ ] Initial security review (Before first deploy)
- [ ] Quarterly code reviews
- [ ] Annual penetration testing (when budget allows)
- [ ] Continuous dependency scanning

### Tools Used

- **npm audit**: Dependency vulnerabilities
- **ESLint**: Code quality & security rules
- **TypeScript**: Type safety
- **Supabase Security Advisor**: Database security

---

## Compliance

### Data Protection

**User Data Collected:**
- Email address (for authentication)
- Reading history (future feature)
- IP address (Supabase logs)

**Data Retention:**
- Active accounts: Indefinite
- Deleted accounts: 30 days
- Logs: 90 days

**User Rights:**
- View own data: Via profile page
- Delete account: Contact admin
- Export data: Contact admin (future)

### GDPR Considerations

- Email confirmation required
- Clear privacy policy (future)
- Data export capability (future)
- Right to deletion

---

## Security Changelog

### 2025-10-23: Initial Security Setup

**Added:**
- Row Level Security on all tables
- Admin bootstrap mechanism
- Protected routes
- Error handling improvements
- Audit logging
- Security documentation

**Fixed:**
- Exposed credentials (require new project)
- Missing RLS policies
- Weak admin authentication

**Changed:**
- `.gitignore` to include `.env`
- Migration structure for security
- Auth flow for better security

---

## Future Security Enhancements

### Short-term (1-3 months)
- [ ] Two-factor authentication
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] CAPTCHA on signup
- [ ] Content Security Policy headers

### Medium-term (3-6 months)
- [ ] Security headers (HSTS, X-Frame-Options)
- [ ] Subresource Integrity for CDN assets
- [ ] Automated security scanning in CI/CD
- [ ] Bug bounty program
- [ ] Penetration testing

### Long-term (6-12 months)
- [ ] SOC 2 compliance
- [ ] Regular external audits
- [ ] Advanced threat monitoring
- [ ] DDoS protection
- [ ] Web Application Firewall

---

## Contact

**Security Team:** [your-email@domain.com]  
**Response Time:** 24-48 hours  
**PGP Key:** [Optional - for encrypted communication]

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.0  
**Review Frequency:** Quarterly

