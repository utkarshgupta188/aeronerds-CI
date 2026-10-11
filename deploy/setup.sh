#!/bin/bash
# One-time setup on Ubuntu 24.04 EC2. Run from the cloned repo: bash deploy/setup.sh
set -e
APP_DIR=/home/ubuntu/aeronerds-CI
DOMAIN=bhumi.utkarshgupta.qzz.io
cd "$APP_DIR"

# System packages (Vite 8 needs Node 20+)
sudo apt-get update -y
sudo apt-get install -y nginx python3 python3-venv python3-pip git certbot python3-certbot-nginx
if ! node -v 2>/dev/null | grep -qE '^v(2[0-9]|[3-9][0-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Backend
python3 -m venv venv
venv/bin/pip install --no-cache-dir -r requirements.txt

# Frontend
(cd frontend && npm ci && npm run build)
chmod o+x /home/ubuntu "$APP_DIR" "$APP_DIR/frontend" "$APP_DIR/frontend/dist"

# Secrets
if [ ! -f .env ]; then
  echo "CEREBRAS_API_KEY=REPLACE_ME" > .env
  echo "Edit $APP_DIR/.env and set CEREBRAS_API_KEY"
fi

# nginx
sudo cp nginx/bhumi.conf /etc/nginx/sites-available/bhumi
sudo ln -sf /etc/nginx/sites-available/bhumi /etc/nginx/sites-enabled/bhumi
sudo nginx -t && sudo systemctl reload nginx

# Backend service
sudo cp deploy/bhumi-backend.service /etc/systemd/system/bhumi-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now bhumi-backend

# HTTPS
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || true

echo "Done: https://$DOMAIN"
