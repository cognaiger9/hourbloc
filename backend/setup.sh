#!/bin/bash

echo "Setting up HourBloc Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Project Settings
PROJECT_NAME=HourBloc API
VERSION=1.0.0
API_V1_STR=/api/v1

# CORS Settings (comma-separated origins)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Supabase Settings
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
EOL
    echo ".env file created. Please update it with your actual configuration."
fi

echo ""
echo "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your Supabase credentials"
echo "2. Run './run.sh' to start the development server"
echo "3. Visit http://localhost:8000/docs to see the API documentation"


