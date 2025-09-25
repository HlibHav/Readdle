# Security Guidelines

## 🔐 API Key Management

### Environment Variables
- **Never commit API keys to version control**
- Use `.env` files for local development (already in `.gitignore`)
- Use environment variables in production
- Follow the principle of least privilege

### Required API Keys
- **OpenAI API Key**: Required for cloud AI processing and advanced features
- **Hugging Face API Key**: Required for Apple OpenELM model access and local processing

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Add your API keys:**
   ```bash
   # Edit server/.env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   HUGGINGFACE_API_KEY=your_actual_huggingface_api_key_here
   ```

3. **Verify your setup:**
   ```bash
   # Check that .env is in .gitignore
   git status
   # Should NOT show .env file
   ```

## 🛡️ Security Best Practices

### Code Security
- ✅ No hardcoded API keys in source code
- ✅ API keys only referenced via environment variables
- ✅ Sensitive logging disabled (only boolean checks)
- ✅ Proper `.gitignore` to exclude sensitive files

### File Exclusions
The following files are excluded from version control:
- `.env` - Contains actual API keys
- `generated-pdfs/` - May contain sensitive documents
- `dist/` - Build artifacts
- `node_modules/` - Dependencies

### API Key Validation
The application validates API keys with:
- Length checks (minimum 20 characters)
- Format validation (not placeholder values)
- Graceful fallback when keys are missing

## 🚨 Security Checklist

Before committing code:
- [ ] No hardcoded API keys in source files
- [ ] `.env` files are in `.gitignore`
- [ ] `env.example` contains only placeholder values
- [ ] No sensitive data in console logs
- [ ] No credentials in comments or documentation

## 🔍 Security Audit Commands

### Check for hardcoded secrets:
```bash
# Search for potential API keys
grep -r "sk-[a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=dist

# Search for other potential secrets
grep -r "password.*=" . --exclude-dir=node_modules --exclude-dir=dist
grep -r "secret.*=" . --exclude-dir=node_modules --exclude-dir=dist
```

### Verify .gitignore:
```bash
# Check that sensitive files are ignored
git status --ignored
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
```bash
OPENAI_API_KEY=your_production_api_key
PORT=5174
DEBUG=false
```

### Security Headers
Consider adding security headers in production:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📞 Incident Response

If you accidentally commit sensitive data:

1. **Immediately revoke the exposed API key**
2. **Remove the data from Git history:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch server/.env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push to update remote repository**
4. **Generate new API keys**
5. **Update all environments with new keys**

## 🔒 Data Privacy & Security

### Local Processing with OpenELM
- **Apple OpenELM Models**: 8 local AI models for complete privacy
- **No Data Transmission**: Local processing ensures data never leaves the device
- **Hugging Face Integration**: Secure model loading with API key authentication
- **Device Optimization**: Models automatically selected based on device capabilities

### Cloud AI Processing
- **Optional Cloud AI**: Users can choose between cloud and local processing
- **Data Control**: When using cloud processing, data is processed by OpenAI
- **Transparent Processing**: Clear indication of where data is processed
- **API Key Security**: All API keys stored securely in environment variables

## 🔒 Additional Security Measures

### Rate Limiting
Consider implementing rate limiting for API endpoints in production.

### Input Validation
All user inputs are validated before processing to prevent injection attacks.

### CORS Configuration
CORS is properly configured to prevent unauthorized cross-origin requests.

### Error Handling
Sensitive error information is not exposed to clients in production.

### Enhanced RAG Security
- **Quality Validation**: Automated response validation prevents low-quality outputs
- **Source Citations**: All responses include source attribution for transparency
- **Confidence Scoring**: Response confidence levels help users assess reliability
