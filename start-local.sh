# AI assisted development

#!/bin/bash

# MedExJob Local Development Startup Script
# यह script backend और frontend दोनों start करेगा

echo "========================================"
echo "  MedExJob Local Development Setup"
echo "========================================"
echo ""

# Check if MySQL is running
echo "Checking MySQL connection..."
if ! nc -z localhost 3306 2>/dev/null; then
    echo "⚠️  WARNING: MySQL server might not be running on port 3306"
    echo "   Please start MySQL server before continuing"
    echo ""
fi

# Check Java
echo "Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found! Please install Java 17 or higher"
    exit 1
fi

# Check Node.js
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js 18 or higher"
    exit 1
fi

echo ""
echo "Starting Backend and Frontend..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Start Backend in background
echo "🚀 Starting Backend (Port 8081)..."
cd "$BACKEND_DIR"
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 5

# Start Frontend in background
echo "🚀 Starting Frontend (Port 5173)..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "  ✅ Both servers starting..."
echo "========================================"
echo ""
echo "Backend:  http://localhost:8081"
echo "Frontend: http://localhost:5173"
echo ""
echo "Logs:"
echo "  Backend:  $BACKEND_DIR/backend.log"
echo "  Frontend: $FRONTEND_DIR/frontend.log"
echo ""
echo "To stop servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

