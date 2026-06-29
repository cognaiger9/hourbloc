#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found. Run setup.sh first."
    exit 1
fi

# Run the FastAPI server
echo "Starting HourBloc API on http://localhost:8000"
echo "Docs available at http://localhost:8000/docs"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug


