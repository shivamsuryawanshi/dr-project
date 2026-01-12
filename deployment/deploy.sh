# AI assisted development
#!/bin/bash

# MedExJob VPS Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 MedExJob Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/opt/medexjob/backend"
FRONTEND_DIR="/var/www/medexjob"
SERVICE_NAME="medexjob-backend"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Function to deploy backend
deploy_backend() {
    print_info "Deploying Backend..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    print_info "Building backend..."
    mvn clean package -DskipTests
    
    if [ $? -eq 0 ]; then
        print_success "Backend built successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi
    
    print_info "Restarting backend service..."
    systemctl restart "$SERVICE_NAME"
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Backend service is running"
    else
        print_error "Backend service failed to start"
        systemctl status "$SERVICE_NAME"
        exit 1
    fi
}

# Function to deploy frontend
deploy_frontend() {
    print_info "Deploying Frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    print_info "Frontend files should be uploaded to: $FRONTEND_DIR"
    print_info "Make sure to build frontend locally first with: npm run build"
    print_info "Then upload dist/* files to $FRONTEND_DIR"
    
    # Set permissions
    chown -R www-data:www-data "$FRONTEND_DIR"
    chmod -R 755 "$FRONTEND_DIR"
    print_success "Frontend permissions updated"
}

# Function to check services
check_services() {
    print_info "Checking services..."
    
    # Check backend
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Backend service is running"
    else
        print_error "Backend service is not running"
    fi
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    # Check mysql
    if systemctl is-active --quiet mysql; then
        print_success "MySQL is running"
    else
        print_error "MySQL is not running"
    fi
}

# Function to view logs
view_logs() {
    print_info "Showing backend logs (last 50 lines)..."
    journalctl -u "$SERVICE_NAME" -n 50 --no-pager
}

# Main menu
case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        print_info "Reloading Nginx..."
        systemctl reload nginx
        ;;
    check)
        check_services
        ;;
    logs)
        view_logs
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all|check|logs}"
        echo ""
        echo "Commands:"
        echo "  backend  - Deploy backend only"
        echo "  frontend - Deploy frontend only"
        echo "  all      - Deploy both backend and frontend"
        echo "  check    - Check service status"
        echo "  logs     - View backend logs"
        exit 1
        ;;
esac

print_success "Deployment completed!"

