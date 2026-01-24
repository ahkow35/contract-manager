#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

# 1. Start Backend
echo "Starting Backend on port 8000..."
cd backend
python3 -m venv venv 2>/dev/null # Ensure venv exists
source venv/bin/activate
uvicorn app.main:app --reload &
cd ..

# 2. Wait for Backend to be ready (optional but good)
sleep 2

# 3. Start Frontend
echo "Starting Frontend on port 5173..."
cd frontend
npm run dev &
cd ..

# 4. Ngrok removed (not required)
# Script continues to wait

# Keep script running
wait
