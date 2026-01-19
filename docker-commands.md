# AI assisted development

# Docker Commands Quick Reference

## 🚀 Basic Commands

```bash
# Start all services
docker-compose up -d

# Start with build
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## 🔍 Status & Info

```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats

# Inspect service
docker-compose config
```

## 🔧 Maintenance

```bash
# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Restart service
docker-compose restart backend

# Remove and recreate
docker-compose up -d --force-recreate backend
```

## 🗑️ Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all -v
```

## 🐚 Access Containers

```bash
# Backend shell
docker exec -it medexjob-backend sh

# Frontend shell
docker exec -it medexjob-frontend sh

# MySQL CLI
docker exec -it medexjob-mysql mysql -u medexjob -p medtech_db
```

## 📊 Health Checks

```bash
# Check backend health
curl http://localhost:8081/api/actuator/health

# Check frontend health
curl http://localhost:80/health

# Check all services
docker-compose ps
```

