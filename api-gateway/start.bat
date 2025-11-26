@echo off
echo 🚀 Starting Room Booking API Gateway...

REM Check if .env file exists
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update the .env file with your configuration
)

REM Create logs directory
if not exist logs mkdir logs

REM Start the API Gateway
echo 🌟 Starting API Gateway on port %PORT%...
npm start
