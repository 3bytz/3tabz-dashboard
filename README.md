# 3TABZ Admin Dashboard (Next.js 14.2.35, App Router)

## Security model (read first)
- The browser never holds the admin JWT. `/api/session/*` route handlers sign in against the API and store the
  token in an **HttpOnly, Secure, SameSite=Strict** cookie (`__Host-3tabz_admin` in production).
- All admin data calls go through `/api/admin/[...path]` (server-side proxy). Only `/admin/*` API paths with
  safe characters are forwarded; `/admin/auth/*` is not reachable through the proxy.
- State-changing requests need a same-origin `Origin` header **and** a CSRF double-submit token
  (`X-CSRF-Token` header must equal the `3tabz_csrf` cookie).
- `middleware.ts` verifies the JWT signature (HS256, `ADMIN_JWT_SECRET`) before rendering any page. The API
  re-checks every call (session id, 30-minute idle timeout, role).
- Two-factor (TOTP) is **mandatory**: the first sign-in shows a QR code to enrol; afterwards every sign-in asks for a code.
- Strict security headers (CSP, frame-ancestors 'none', HSTS, nosniff, no-referrer, noindex) in `next.config.js`.

## Environment
```
ADMIN_API_URL=https://api.3tabz.com/v1     # server-side only
ADMIN_JWT_SECRET=<same value as the API's ADMIN_JWT_SECRET>
```
No `NEXT_PUBLIC_*` variables are needed. Mock data has been removed.

## Run
```
npm ci
npm run build && npm start      # port 3001
```

## Pages added
- **Audit log** (super_admin): every admin action, read-only.
- **Push performance**: sent / opened / suppressed (preference, quiet hours, daily cap, no device) per notification type.
- **Meal templates**: validated JSON editor for the nutrition planner's food list.

## Notes
- Next.js 14.2.35 is the patched 14.x release for CVE-2025-29927 (middleware bypass) and CVE-2025-55184/67779
  (RSC denial of service). Next 14 is no longer the active release line — plan an upgrade to 15.5.x/16.x.
- Behind a load balancer the API sees the dashboard server's IP. The admin IP allow-list (Settings) should list
  the dashboard's egress IP(s), and the dashboard itself should sit behind a VPN/SSO or an IP-restricted load balancer.
