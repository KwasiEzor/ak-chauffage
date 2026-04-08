#!/bin/bash

# AK CHAUFFAGE - Deployment Setup Wizard
# Interactive script to configure automatic deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                    ║${NC}"
echo -e "${BLUE}║       AK CHAUFFAGE - Deployment Setup Wizard      ║${NC}"
echo -e "${BLUE}║                                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to print warning
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running on server or local machine
if [ -f "/etc/os-release" ]; then
    . /etc/os-release
    OS=$NAME
else
    OS="Unknown"
fi

info "Detected OS: $OS"
echo ""

# Choose deployment method
echo -e "${YELLOW}Choose your deployment method:${NC}"
echo ""
echo "  1) GitHub Actions (Recommended for production)"
echo "     ✓ Runs on GitHub infrastructure"
echo "     ✓ Most reliable and secure"
echo "     ✓ Requires GitHub repository"
echo ""
echo "  2) Webhook Server (Good for VPS)"
echo "     ✓ Runs on your server"
echo "     ✓ Instant deployment on push"
echo "     ✓ Simple setup"
echo ""
echo "  3) Manual Deployment Script"
echo "     ✓ Full control"
echo "     ✓ Run via SSH"
echo "     ✓ Good for testing"
echo ""
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo -e "${GREEN}Setting up GitHub Actions deployment...${NC}"
        echo ""

        info "GitHub Actions is already configured!"
        info "Configuration file: .github/workflows/deploy.yml"
        echo ""

        warn "You need to configure GitHub Secrets:"
        echo ""
        echo "1. Go to your GitHub repository"
        echo "2. Navigate to: Settings → Secrets and variables → Actions"
        echo "3. Add the following secrets:"
        echo ""
        echo "   VPS_HOST        = Your server IP or domain"
        echo "   VPS_USERNAME    = SSH username (e.g., www-data)"
        echo "   VPS_SSH_KEY     = Private SSH key for deployment"
        echo "   VPS_PORT        = SSH port (default: 22)"
        echo ""

        read -p "Generate SSH key on server? (y/n): " GEN_KEY
        if [ "$GEN_KEY" = "y" ]; then
            echo ""
            info "Run these commands on your VPS:"
            echo ""
            echo -e "${CYAN}ssh-keygen -t ed25519 -C 'github-deploy' -f ~/.ssh/github-deploy${NC}"
            echo -e "${CYAN}cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys${NC}"
            echo -e "${CYAN}cat ~/.ssh/github-deploy${NC}"
            echo ""
            warn "Copy the private key output and add it as VPS_SSH_KEY in GitHub Secrets"
        fi

        success "GitHub Actions setup complete!"
        echo ""
        info "Push to main branch to trigger deployment"
        ;;

    2)
        echo ""
        echo -e "${GREEN}Setting up Webhook Server...${NC}"
        echo ""

        # Generate webhook secret
        WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)

        # Ask for port
        read -p "Webhook port (default: 9000): " WEBHOOK_PORT
        WEBHOOK_PORT=${WEBHOOK_PORT:-9000}

        # Update .env file
        if [ -f "server/.env" ]; then
            if grep -q "WEBHOOK_PORT" server/.env; then
                info ".env already has webhook configuration"
            else
                echo "" >> server/.env
                echo "# Webhook Configuration" >> server/.env
                echo "WEBHOOK_PORT=$WEBHOOK_PORT" >> server/.env
                echo "WEBHOOK_SECRET=$WEBHOOK_SECRET" >> server/.env
                success "Added webhook configuration to server/.env"
            fi
        else
            error "server/.env not found!"
            exit 1
        fi

        # Show GitHub webhook configuration
        echo ""
        info "Webhook server configuration:"
        echo "  Port: $WEBHOOK_PORT"
        echo "  Secret: $WEBHOOK_SECRET"
        echo ""

        warn "Configure GitHub webhook:"
        echo ""
        echo "1. Go to: https://github.com/YOUR-USERNAME/ak-chauffage/settings/hooks"
        echo "2. Click 'Add webhook'"
        echo "3. Payload URL: http://YOUR-SERVER-IP:$WEBHOOK_PORT/webhook"
        echo "4. Content type: application/json"
        echo "5. Secret: $WEBHOOK_SECRET"
        echo "6. Events: Just the push event"
        echo ""

        read -p "Start webhook server now? (y/n): " START_WEBHOOK
        if [ "$START_WEBHOOK" = "y" ]; then
            if command -v pm2 &> /dev/null; then
                pm2 start webhook-server.cjs --name webhook
                pm2 save
                success "Webhook server started!"
                info "View logs: pm2 logs webhook"
            else
                warn "PM2 not installed. Install with: npm install -g pm2"
                info "Then run: pm2 start webhook-server.cjs --name webhook"
            fi
        fi

        success "Webhook setup complete!"
        ;;

    3)
        echo ""
        echo -e "${GREEN}Setting up Manual Deployment...${NC}"
        echo ""

        info "Deployment script: deploy.sh"

        # Make script executable
        chmod +x deploy.sh
        success "Made deploy.sh executable"

        echo ""
        info "Usage:"
        echo "  On server:  ./deploy.sh"
        echo "  Via SSH:    ssh user@server 'cd /path/to/project && ./deploy.sh'"
        echo ""

        read -p "Create deployment alias? (y/n): " CREATE_ALIAS
        if [ "$CREATE_ALIAS" = "y" ]; then
            read -p "Enter server user@host (e.g., www-data@your-server.com): " SERVER
            read -p "Enter project path on server (e.g., /var/www/ak-chauffage): " PROJECT_PATH

            ALIAS_LINE="alias deploy-ak='ssh $SERVER \"cd $PROJECT_PATH && ./deploy.sh\"'"

            echo ""
            info "Add this to your ~/.bashrc or ~/.zshrc:"
            echo ""
            echo -e "${CYAN}$ALIAS_LINE${NC}"
            echo ""
            info "Then reload your shell: source ~/.bashrc"
            info "Deploy with: deploy-ak"
        fi

        success "Manual deployment setup complete!"
        ;;

    *)
        error "Invalid choice!"
        exit 1
        ;;
esac

# PM2 Setup (common for all methods)
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}         PM2 Process Management         ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

if command -v pm2 &> /dev/null; then
    success "PM2 is installed"

    read -p "Configure PM2 for production? (y/n): " SETUP_PM2
    if [ "$SETUP_PM2" = "y" ]; then
        info "Starting application with PM2..."

        # Stop if already running
        pm2 delete ak-chauffage 2>/dev/null || true

        # Start with ecosystem file
        pm2 start ecosystem.config.cjs --env production
        pm2 save

        success "Application started with PM2"

        # Setup startup script
        read -p "Enable PM2 startup on boot? (y/n): " STARTUP
        if [ "$STARTUP" = "y" ]; then
            pm2 startup
            warn "Follow the command above to complete startup setup"
        fi
    fi
else
    warn "PM2 is not installed"
    read -p "Install PM2 globally? (y/n): " INSTALL_PM2
    if [ "$INSTALL_PM2" = "y" ]; then
        if command -v npm &> /dev/null; then
            npm install -g pm2
            success "PM2 installed successfully"
        else
            error "npm not found! Install Node.js first"
        fi
    fi
fi

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}║            Setup Complete! 🎉                      ║${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
info "Documentation: DEPLOYMENT_AUTOMATION.md"
info "Test deployment: Push to main branch or run ./deploy.sh"
echo ""
success "You're ready to deploy automatically!"
echo ""
