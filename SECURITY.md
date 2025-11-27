# Security Policy

## Supported Versions

As this project is currently in development, security updates will be applied to the main branch.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

Once we release stable versions, this table will be updated accordingly.

---

## Reporting a Vulnerability

We take the security of Martnex seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publish the Vulnerability

Please do not create a public GitHub issue for security vulnerabilities. This helps protect users who are running Martnex.

### 2. Report Privately

Send details to: **suleman192@gmail.com** (or create a private security advisory on GitHub)

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### 3. What to Expect

- **Acknowledgment:** We'll acknowledge your email within 48 hours
- **Investigation:** We'll investigate and keep you updated on progress
- **Fix Timeline:** Critical issues will be prioritized and fixed ASAP
- **Credit:** With your permission, we'll credit you in the security advisory

---

## Security Best Practices for Contributors

When contributing code, please:

### Authentication & Authorization
- Never hardcode credentials or API keys
- Use environment variables for sensitive data
- Implement proper JWT token validation
- Follow principle of least privilege for role-based access

### Data Protection
- Sanitize all user inputs
- Use parameterized queries (ORM handles this)
- Validate data on both client and server
- Hash passwords using bcrypt (minimum 10 rounds)

### API Security
- Implement rate limiting
- Use HTTPS in production
- Validate request origins (CORS)
- Add CSRF protection for state-changing operations

### Dependencies
- Regularly update dependencies
- Run `npm audit` before committing
- Review security advisories for used packages

### Payment Processing
- Never store credit card information
- Use PCI-compliant payment processors (Stripe, PayPal)
- Verify webhook signatures

---

## Security Features

Martnex implements these security measures:

- **Authentication:** JWT-based with secure token storage
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Zod schemas for all user inputs
- **SQL Injection Prevention:** TypeORM parameterized queries
- **XSS Prevention:** Input sanitization and output encoding
- **CSRF Protection:** CSRF tokens for forms
- **Rate Limiting:** Redis-based rate limiting
- **HTTPS:** Enforced in production
- **Security Headers:** Helmet.js configuration
- **Dependency Scanning:** Regular npm audit

---

## Security Checklist for Releases

Before each release, verify:

- [ ] All dependencies are up to date
- [ ] No known vulnerabilities in dependencies
- [ ] All environment variables properly documented
- [ ] No secrets committed to repository
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authentication working correctly
- [ ] Authorization rules enforced
- [ ] HTTPS enforced
- [ ] Error messages don't leak sensitive info

---

## Known Security Considerations

### Development Phase
- Project is in active development
- Security features are being implemented incrementally
- Not recommended for production use until v1.0.0 release

### Third-Party Services
- AWS S3/Cloudinary for file storage
- Stripe/PayPal for payments (PCI compliant)
- SendGrid/Mailgun for emails
- Twilio for SMS

All third-party integrations follow their respective security best practices.

---

## Security Updates

Security updates will be announced via:
- GitHub Security Advisories
- CHANGELOG.md
- GitHub Releases

Subscribe to repository notifications to stay informed.

---

Thank you for helping keep Martnex and its users safe!
