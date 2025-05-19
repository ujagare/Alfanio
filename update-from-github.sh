#!/bin/bash

# Update from GitHub Script for Alfanio Website
# This script pulls the latest changes from GitHub and deploys them to the Hostinger VPS
# Usage: ./update-from-github.sh [branch]

# Exit on error
set -e

# Default branch
BRANCH=${1:-main}

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define variables
APP_DIR="/var/www/Alfanio"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_DIR="$APP_DIR/backend"
LOG_FILE="$APP_DIR/logs/deployment.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Success function
success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Warning function
warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Error function
error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Start deployment
log "Starting deployment process for branch: $BRANCH"

# Navigate to the app directory
cd "$APP_DIR" || error "Failed to navigate to $APP_DIR"

# Stash any local changes
log "Stashing local changes if any..."
git stash

# Fetch the latest changes
log "Fetching latest changes from remote..."
git fetch --all || error "Failed to fetch from remote"

# Pull the latest changes
log "Pulling latest changes from $BRANCH..."
git pull origin "$BRANCH" || error "Failed to pull from $BRANCH"
success "Latest changes pulled successfully"

# Restart services with PM2
log "Restarting services with PM2..."
pm2 reload all || warning "Failed to reload PM2 processes"
success "PM2 processes reloaded successfully"

# Restart Nginx
log "Testing Nginx configuration..."
nginx -t && {
    log "Restarting Nginx..."
    systemctl restart nginx || warning "Failed to restart Nginx"
    success "Nginx restarted successfully"
} || warning "Nginx configuration test failed, not restarting"

# Deployment completed
success "Deployment completed successfully!"
log "The Alfanio website has been updated with the latest changes from the $BRANCH branch"
