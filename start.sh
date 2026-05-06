#!/bin/bash

echo "🚀 Starting MitBridge Backend & Frontend..."
echo ""

# Start backend in background
cd /home/ubuntu/oti-internship/backend
echo "📦 Starting Backend on http://localhost:4000..."
node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:4000/health > /dev/null; then
    echo "   ✅ Backend is UP!"
else
    echo "   ❌ Backend failed to start"
    exit 1
fi

echo ""
echo "🎨 Starting Frontend on http://localhost:3000..."
cd /home/ubuntu/oti-internship/frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
