#!/bin/bash

# Exit on error
set -e

echo "Building and deploying JobPilot..."

# Navigate to project root
cd "$(dirname "$0")"

# Backend setup
echo "Setting up backend..."
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend build
echo "Building frontend..."
cd frontend
npm install
npm run build

# Copy frontend build to Django static
echo "Copying frontend build to Django static..."
cd ..
rm -rf backend/static/frontend
mkdir -p backend/static/frontend
cp -r frontend/dist/* backend/static/frontend/

# Start production server
echo "Starting production server..."
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
