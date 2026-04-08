#!/bin/bash

# AK CHAUFFAGE - Deployment Script
# This script handles the deployment process on the server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory (update this path for your server)
PROJECT_DIR="${PROJECT_DIR:-/var/www/ak-chauffage}"
APP_NAME="ak-chauffage"
BACKUP_DIR="$PROJECT_DIR/backups"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AK CHAUFFAGE - Automated Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to print success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error message
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info message
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    error "Do not run this script as root!"
    exit 1
fi

# Navigate to project directory
info "Navigating to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || { error "Project directory not found!"; exit 1; }

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current state
info "Creating backup..."
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" data/ uploads/ server/.env 2>/dev/null || true
success "Backup created: $BACKUP_FILE"

# Pull latest code
info "Pulling latest code from GitHub..."
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    info "Already up to date. No deployment needed."
    exit 0
fi

git pull origin main || { error "Git pull failed!"; exit 1; }
success "Code updated successfully"

# Show what changed
echo ""
info "Changes in this deployment:"
git log --oneline --decorate --graph $CURRENT_COMMIT..HEAD | head -10
echo ""

# Install/update dependencies
info "Installing dependencies..."
npm ci --only=production || { error "npm install failed!"; exit 1; }
success "Dependencies installed"

# Build frontend
info "Building frontend..."
npm run build || { error "Build failed!"; exit 1; }
success "Frontend built successfully"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Install it with: npm install -g pm2"
    exit 1
fi

# Restart application with PM2
info "Restarting application..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    # App exists, reload it (zero-downtime)
    pm2 reload "$APP_NAME" --update-env || { error "PM2 reload failed!"; exit 1; }
    success "Application reloaded (zero-downtime)"
else
    # App doesn't exist, start it
    pm2 start server/index.cjs --name "$APP_NAME" || { error "PM2 start failed!"; exit 1; }
    success "Application started"
fi

# Save PM2 process list
pm2 save > /dev/null 2>&1

# Show status
echo ""
info "Application status:"
pm2 status "$APP_NAME"

# Check if app is running
if pm2 describe "$APP_NAME" | grep -q "status.*online"; then
    success "Application is running!"
else
    error "Application is not running properly!"
    exit 1
fi

# Clean up old backups (keep last 10)
info "Cleaning up old backups..."
ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
success "Old backups cleaned"

# Show deployment summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Deployment Successful! 🎉${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  - Previous commit: ${CURRENT_COMMIT:0:7}"
echo "  - Current commit:  ${LATEST_COMMIT:0:7}"
echo "  - Backup: $BACKUP_FILE"
echo "  - Application: $APP_NAME"
echo "  - Status: $(pm2 describe "$APP_NAME" | grep -o 'status.*' | head -1)"
echo ""
echo "🌐 Visit: https://ak-chauffage.be"
echo "📝 Logs: pm2 logs $APP_NAME"
echo ""
