#!/bin/bash
# EC2 Ubuntu 22.04 — run once as ubuntu user
set -e

# 1. System deps
sudo apt-get update -y
sudo apt-get install -y nginx python3 python3-venv python3-pip nodejs npm git

# 2. Clone repo
sudo mkdir -p /var/www/bhumi
sudo chown ubuntu:ubuntu /var/www/bhumi
git clone https://github.com/utkarshgupta188/aeronerds-CI.git /var/www/bhumi
cd /var/www/bhumi

# 3. Python venv + deps
python3 -m venv venv
venv/bin/pip install --no-cache-dir -r requirements.txt
venv/bin/pip install --no-cache-dir cerebras-cloud-sdk

# 4. Build frontend
cd frontend && npm ci && npm run build && cd ..

# 5. .env
cat > .env <<'EOF'
CEREBRAS_API_KEY=REPLACE_ME
EOF
echo "⚠  Edit /var/www/bhumi/.env and set CEREBRAS_API_KEY"

# 6. nginx
sudo cp nginx/bhumi.conf /etc/nginx/sites-available/bhumi
sudo ln -sf /etc/nginx/sites-available/bhumi /etc/nginx/sites-enabled/bhumi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. systemd service
sudo cp deploy/bhumi-backend.service /etc/systemd/system/bhumi-backend.service
sudo systemctl daemon-reload
sudo systemctl enable bhumi-backend
sudo systemctl start bhumi-backend

echo "✓ Done. Edit .env then: sudo systemctl restart bhumi-backend"
