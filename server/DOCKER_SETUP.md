# Docker Setup for Phoenix AI Observability

This document describes the Docker setup for running Phoenix AI observability with your Documents Browser application.

## 🐳 Architecture

The setup uses Docker Compose to manage Phoenix AI observability as a containerized service, while your Node.js application runs natively for development.

### Services

- **Phoenix AI**: Containerized observability service
- **Node.js App**: Runs natively for development (with volume mounts for hot reloading)

## 📁 Files Created

### Docker Configuration
- `Dockerfile.phoenix` - Custom Phoenix AI container
- `docker-compose.yml` - Service orchestration
- `.dockerignore` - Build optimization
- `.env.docker` - Docker-specific environment variables

### Documentation
- `DOCKER_SETUP.md` - This documentation

## 🚀 Quick Start

### 1. Start Phoenix AI (Docker)
```bash
cd /Users/Glebazzz/Readdle/server
docker-compose up -d phoenix
```

### 2. Start Your Application (Native)
```bash
cd /Users/Glebazzz/Readdle/server
npm run dev
```

### 3. Access Services
- **Phoenix UI**: http://localhost:6006
- **Your App**: http://localhost:5174
- **Test Observability**: `curl -X POST http://localhost:5174/api/phoenix/test`

## 🔧 Configuration

### Environment Variables
The `.env.docker` file contains Docker-specific configuration:
```env
PHOENIX_COLLECTOR_ENDPOINT=http://phoenix:4317
PHOENIX_PROJECT_NAME=documents-browser-app
```

### Ports
- **6006**: Phoenix UI
- **4317**: gRPC OTLP endpoint
- **4318**: HTTP OTLP endpoint
- **5174**: Your application

## 🛠️ Development Workflow

### Start Everything
```bash
# Terminal 1: Start Phoenix
docker-compose up -d phoenix

# Terminal 2: Start your app
npm run dev
```

### Stop Everything
```bash
# Stop Phoenix
docker-compose down

# Stop your app
# Ctrl+C in the terminal running npm run dev
```

### Rebuild Phoenix
```bash
docker-compose build phoenix
docker-compose up -d phoenix
```

## 📊 Monitoring

### Check Phoenix Status
```bash
# Check if Phoenix is running
curl http://localhost:6006/health

# View Phoenix logs
docker logs phoenix-observability

# Check container status
docker ps
```

### Test Observability
```bash
# Create test traces
curl -X POST http://localhost:5174/api/phoenix/test

# Check Phoenix UI
open http://localhost:6006
```

## 🔍 Troubleshooting

### Phoenix Not Starting
```bash
# Check logs
docker logs phoenix-observability

# Rebuild container
docker-compose build phoenix --no-cache
docker-compose up -d phoenix
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :6006
lsof -i :4317
lsof -i :4318

# Stop conflicting services
docker-compose down
```

### Traces Not Appearing
1. Verify Phoenix is running: `curl http://localhost:6006/health`
2. Check your app's environment variables
3. Ensure `PHOENIX_COLLECTOR_ENDPOINT=http://phoenix:4317` is set
4. Test with: `curl -X POST http://localhost:5174/api/phoenix/test`

## 🎯 Benefits

### ✅ Advantages of This Setup
- **Isolated Phoenix**: No conflicts with local Python environments
- **Consistent Environment**: Phoenix runs the same way across different machines
- **Easy Management**: Simple Docker Compose commands
- **Development Friendly**: Your app still runs natively for hot reloading
- **Port Management**: No more port conflicts

### 🔄 Migration from Native Setup
If you were running Phoenix natively before:
1. Stop the native Phoenix process
2. Start the Docker version: `docker-compose up -d phoenix`
3. Update your `.env` to use `http://localhost:4317` instead of `http://localhost:4318`

## 📝 Next Steps

### Production Considerations
For production deployment, consider:
1. Using a production-grade database instead of SQLite
2. Adding authentication to Phoenix
3. Setting up proper logging and monitoring
4. Using Docker for both services

### Scaling
- Phoenix can handle multiple applications
- Each app should use a unique `PHOENIX_PROJECT_NAME`
- Consider using Phoenix Cloud for production workloads

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker logs phoenix-observability`
2. Verify environment variables
3. Ensure all ports are available
4. Try rebuilding the containers

---

**Status**: ✅ Working - Phoenix AI observability is now running in Docker with your Node.js application!



