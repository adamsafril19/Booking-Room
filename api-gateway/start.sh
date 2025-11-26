#!/bin/bash

echo "🚀 Starting Room Booking API Gateway..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
fi

# Create logs directory
mkdir -p logs

# Start the API Gateway
echo "🌟 Starting API Gateway on port ${PORT:-8000}..."
npm start
