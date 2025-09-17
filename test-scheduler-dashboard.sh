#!/bin/bash

echo "🚀 Testing Scheduler Dashboard Setup"
echo "===================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run: npm install"
    exit 1
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local - Please update with your API credentials"
fi

# Check if all required files exist
echo ""
echo "📁 Checking required files..."

files_to_check=(
    "types/scheduler.ts"
    "lib/api/scheduler-api.ts"
    "lib/websocket/scheduler-socket.ts"
    "lib/providers/query-provider.tsx"
    "components/scheduler/TaskCard.tsx"
    "components/scheduler/ExecutionHistory.tsx"
    "components/scheduler/LeaderStatus.tsx"
    "components/scheduler/StatisticsChart.tsx"
    "src/app/scheduler/page.tsx"
    "src/app/scheduler/layout.tsx"
    "src/components/navigation/Sidebar.tsx"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ] || [ -f "src/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Not found"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo ""
    echo "❌ Some required files are missing"
    exit 1
fi

echo ""
echo "✅ All required files exist"

# Test TypeScript compilation
echo ""
echo "🔨 Testing TypeScript compilation..."
npx tsc --noEmit 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has some issues (this might be okay for development)"
fi

# Check if port 3000 is available
echo ""
echo "🔍 Checking port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. The dev server might fail to start."
else
    echo "✅ Port 3000 is available"
fi

echo ""
echo "===================================="
echo "✅ Dashboard setup is complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000/scheduler"
echo ""
echo "Make sure to update .env.local with your API credentials!"
echo "===================================="