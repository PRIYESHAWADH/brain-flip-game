# Brain Flip Battle Server Development Startup Script
Write-Host "🚀 Starting Brain Flip Battle Server Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "🎮 Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "pgAdmin: http://localhost:5050 (admin@brainflip.com / admin)" -ForegroundColor Cyan
Write-Host "Redis Commander: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""

npm run dev

Write-Host ""
Write-Host "🛑 Development server stopped" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
