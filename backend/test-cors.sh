#!/bin/bash
#
# Test CORS on auth registration endpoint
#

echo "Testing CORS on /auth/register endpoint..."
echo ""

curl -i -X OPTIONS http://localhost:9001/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  2>&1 | grep -E "(HTTP|Access-Control|CORS)"

echo ""
echo "---"
echo "Testing POST request with CORS..."
echo ""

curl -i -X POST http://localhost:9001/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","first_name":"Test","role":"buyer"}' \
  2>&1 | head -30 | grep -E "(HTTP|Access-Control|message|error)"
