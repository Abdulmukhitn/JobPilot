#!/bin/bash

# Exit on error
set -e

echo "Starting JobPilot development servers..."

# Navigate to project root
cd "$(dirname "$0")"

# Kill any existing processes on ports 3000 and 8000
echo "Cleaning up existing processes..."
kill $(lsof -t -i:3000) 2>/dev/null || true
kill $(lsof -t -i:8000) 2>/dev/null || true

# Backend setup
echo -e "\n📦 Setting up backend..."
python -m pip install -r requirements.txt
python manage.py migrate

# Frontend setup
echo -e "\n🔧 Setting up frontend..."
cd frontend
npm install

# Start both servers
echo -e "\n🚀 Starting servers..."
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"
echo -e "\nPress Ctrl+C to stop both servers\n"

# Start backend
cd ..
python manage.py runserver &

# Start frontend
cd frontend
npm run dev &

# Wait for both processes and handle Ctrl+C
cleanup() {
    echo -e "\n\n🛑 Stopping servers..."
    kill $(jobs -p)
    exit 0
}

trap cleanup INT
wait
