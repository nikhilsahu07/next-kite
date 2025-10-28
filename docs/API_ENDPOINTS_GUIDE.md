# 🚀 Kite Account Management API - Quick Reference

## Base URL
```
http://localhost:5001
```

---

## 📁 Account Management APIs

### Create New Account
```bash
curl -X POST http://localhost:5001/kite/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "clientId": "ABC123",
    "phoneNumber": "+919876543210",
    "password": "mypassword",
    "apiKey": "your_api_key",
    "apiSecret": "your_api_secret",
    "accountName": "My Trading Account",
    "accountType": "live"
  }'
```

### Get All User Accounts (with secrets & sessions)
```bash
curl "http://localhost:5001/kite/accounts/user/user123/with-sessions?includeSecrets=true"
```

### Get Single Account
```bash
curl "http://localhost:5001/kite/accounts/ACCOUNT_ID?includeSecrets=true"
```

### Update Account
```bash
curl -X PUT http://localhost:5001/kite/accounts/ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Updated Account Name",
    "status": "active"
  }'
```

### Delete Account
```bash
curl -X DELETE http://localhost:5001/kite/accounts/ACCOUNT_ID
```

---

## 🔐 Authentication & Login

### Get Login URL
```bash
curl http://localhost:5001/kite/auth/login-url/ACCOUNT_ID
```

Response:
```json
{
  "success": true,
  "loginUrl": "https://kite.zerodha.com/connect/login?api_key=..."
}
```

### Handle OAuth Callback (Exchange Request Token)
```bash
curl -X POST http://localhost:5001/kite/auth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "requestToken": "REQUEST_TOKEN_FROM_CALLBACK"
  }'
```

### Test Connection / Validate Token
```bash
curl -X POST http://localhost:5001/kite/auth/validate/ACCOUNT_ID
```

### Refresh Access Token
```bash
curl -X POST http://localhost:5001/kite/auth/refresh/ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "requestToken": "NEW_REQUEST_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5001/kite/auth/logout/ACCOUNT_ID
```

---

## 🎫 Session Management

### Get Active Session
```bash
curl http://localhost:5001/kite/sessions/account/ACCOUNT_ID/active
```

### Get All Sessions for Account
```bash
curl http://localhost:5001/kite/sessions/account/ACCOUNT_ID
```

### Invalidate Session
```bash
curl -X POST http://localhost:5001/kite/sessions/SESSION_ID/invalidate
```

### Cleanup Expired Sessions (Manual)
```bash
curl -X POST http://localhost:5001/kite/sessions/cleanup
```

---

## 📊 Kite Connect Data APIs

### Get User Profile
```bash
curl http://localhost:5001/kite/profile/ACCOUNT_ID
```

### Get Holdings
```bash
curl http://localhost:5001/kite/holdings/ACCOUNT_ID
```

### Get Positions
```bash
curl http://localhost:5001/kite/positions/ACCOUNT_ID
```

### Get Orders
```bash
curl http://localhost:5001/kite/orders/ACCOUNT_ID
```

### Place Order
```bash
curl -X POST http://localhost:5001/kite/orders/ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "NSE",
    "tradingsymbol": "INFY",
    "transaction_type": "BUY",
    "quantity": 1,
    "order_type": "MARKET",
    "product": "CNC"
  }'
```

### Get Instruments
```bash
# All instruments
curl http://localhost:5001/kite/instruments/ACCOUNT_ID

# Specific exchange
curl "http://localhost:5001/kite/instruments/ACCOUNT_ID?exchange=NSE"
```

### Get Quote
```bash
curl "http://localhost:5001/kite/quote/ACCOUNT_ID?instruments=NSE:INFY,NSE:TCS"
```

### Get LTP (Last Traded Price)
```bash
curl "http://localhost:5001/kite/ltp/ACCOUNT_ID?instruments=NSE:INFY"
```

### Get OHLC
```bash
curl "http://localhost:5001/kite/ohlc/ACCOUNT_ID?instruments=NSE:INFY"
```

### Get Historical Data
```bash
curl "http://localhost:5001/kite/historical/ACCOUNT_ID/INSTRUMENT_TOKEN/day?from=2024-01-01&to=2024-01-31"
```

### Get Margins
```bash
# All segments
curl http://localhost:5001/kite/margins/ACCOUNT_ID

# Specific segment
curl "http://localhost:5001/kite/margins/ACCOUNT_ID?segment=equity"
```

---

## 🎯 Common Workflows

### Workflow 1: Setup New Account & Login

```bash
# 1. Create account
ACCOUNT_ID=$(curl -s -X POST http://localhost:5001/kite/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "clientId": "ABC123",
    "password": "mypassword",
    "apiKey": "your_api_key",
    "apiSecret": "your_api_secret",
    "accountName": "My Account",
    "accountType": "live"
  }' | jq -r '.accountId')

echo "Created account: $ACCOUNT_ID"

# 2. Get login URL
LOGIN_URL=$(curl -s http://localhost:5001/kite/auth/login-url/$ACCOUNT_ID | jq -r '.loginUrl')
echo "Login URL: $LOGIN_URL"

# 3. Open in browser, complete OAuth, get request_token

# 4. Exchange request_token for access_token
curl -X POST http://localhost:5001/kite/auth/callback \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"requestToken\": \"YOUR_REQUEST_TOKEN\"
  }"
```

### Workflow 2: Get Account Data

```bash
# Get all accounts with sessions
curl "http://localhost:5001/kite/accounts/user/user123/with-sessions?includeSecrets=true" | jq '.'

# Test connection for each account
for accountId in $(curl -s "http://localhost:5001/kite/accounts/user/user123" | jq -r '.accounts[].accountId'); do
  echo "Testing $accountId..."
  curl -s -X POST "http://localhost:5001/kite/auth/validate/$accountId" | jq '.connected'
done
```

### Workflow 3: Place Trade

```bash
ACCOUNT_ID="your-account-id"

# 1. Check margins
curl "http://localhost:5001/kite/margins/$ACCOUNT_ID?segment=equity" | jq '.data.available.cash'

# 2. Get quote
curl "http://localhost:5001/kite/quote/$ACCOUNT_ID?instruments=NSE:INFY" | jq '.'

# 3. Place order
ORDER_ID=$(curl -s -X POST "http://localhost:5001/kite/orders/$ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "NSE",
    "tradingsymbol": "INFY",
    "transaction_type": "BUY",
    "quantity": 1,
    "order_type": "MARKET",
    "product": "CNC"
  }' | jq -r '.data.order_id')

echo "Order placed: $ORDER_ID"

# 4. Get order status
curl "http://localhost:5001/kite/orders/$ACCOUNT_ID" | jq ".data[] | select(.order_id == \"$ORDER_ID\")"
```

---

## 📝 Response Examples

### Successful Account Creation
```json
{
  "success": true,
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "account": {
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "clientId": "ABC123",
    "phoneNumber": "+919876543210",
    "password": "********",
    "apiKey": "your_api_key",
    "apiSecret": "********",
    "accountName": "My Trading Account",
    "accountType": "live",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Active Session Response
```json
{
  "success": true,
  "session": {
    "sessionId": "660e8400-e29b-41d4-a716-446655440001",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "accessToken": "your_access_token",
    "requestToken": "request_token",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "expiresAt": 1705409700000,
    "status": "active",
    "lastUsed": "2024-01-15T11:00:00.000Z",
    "isExpired": false
  }
}
```

### Token Expired Response
```json
{
  "success": false,
  "error": "No valid session found. Request token required to generate new access token.",
  "requiresLogin": true,
  "loginUrl": "https://kite.zerodha.com/connect/login?api_key=..."
}
```

---

## 🔍 Testing Tips

### 1. Test with jq (JSON processor)
```bash
# Pretty print all accounts
curl -s "http://localhost:5001/kite/accounts/user/user123" | jq '.'

# Extract specific fields
curl -s "http://localhost:5001/kite/accounts/user/user123" | jq '.accounts[] | {accountName, status, hasActiveSession}'
```

### 2. Save response to file
```bash
curl "http://localhost:5001/kite/accounts/user/user123/with-sessions" > accounts.json
```

### 3. Test in Postman
Import this collection:
```json
{
  "info": {
    "name": "Kite Account Management",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001"
    },
    {
      "key": "accountId",
      "value": ""
    }
  ]
}
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 404 - Account Not Found
```json
{
  "success": false,
  "error": "Account not found"
}
```

#### 400 - Missing Parameters
```json
{
  "success": false,
  "error": "accountId and requestToken are required"
}
```

#### 401 - Invalid Token
```json
{
  "success": false,
  "valid": false,
  "error": "Invalid or expired access token"
}
```

#### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## 🎓 Best Practices

1. **Always check `success` field** in responses
2. **Handle `requiresLogin`** by redirecting to `loginUrl`
3. **Use `includeSecrets=true`** only when necessary
4. **Store `accountId`** after creation for future use
5. **Test connections periodically** with `/auth/validate`
6. **Monitor session expiry** (24 hours from creation)
7. **Implement error handling** for all API calls
8. **Use HTTPS** in production environments
9. **Rate limit** API calls to avoid throttling
10. **Log all errors** for debugging

---

**🚀 Ready to integrate! Check KITE_SETUP_README.md for full documentation.**

