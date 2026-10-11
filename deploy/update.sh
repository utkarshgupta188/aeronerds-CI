#!/bin/bash
# Redeploy after git push. Run on EC2: bash deploy/update.sh
set -e
cd /home/ubuntu/aeronerds-CI
git pull origin main
venv/bin/pip install --no-cache-dir -q -r requirements.txt
(cd frontend && npm ci && npm run build)
sudo systemctl restart bhumi-backend
sleep 3
curl -sf -X POST http://127.0.0.1:8010/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"plot_area":100,"road_width":9,"building_height":10}' > /dev/null \
  && echo "Backend OK" || { echo "Backend FAILED"; sudo journalctl -u bhumi-backend -n 20 --no-pager; exit 1; }
