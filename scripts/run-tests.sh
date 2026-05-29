#!/bin/bash

set -e

echo "Running backend tests..."

if [ ! -d ".venv" ]; then
  echo "Error: .venv not found."
  echo "Please create virtual environment first:"
  echo "  python3.12 -m venv .venv"
  echo "  source .venv/bin/activate"
  echo "  python -m pip install -r requirements.txt"
  exit 1
fi

source .venv/bin/activate

if ! redis-cli ping > /dev/null 2>&1; then
  echo "Error: Redis is not running."
  echo "Start Redis first:"
  echo "  brew services start redis"
  exit 1
fi

python -m pytest -q