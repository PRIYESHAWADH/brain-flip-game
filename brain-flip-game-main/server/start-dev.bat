@echo off
echo 🚀 Starting Brain Flip Battle Server Development Environment...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🐳 Starting Docker services...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Checking service health...
call docker-compose ps

echo.
echo 🎮 Starting development server...
call npm run dev

echo.
echo 🛑 Development server stopped
pause
