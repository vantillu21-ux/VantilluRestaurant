#!/bin/bash
set -e

echo "Running production database migrations..."
cd "$(dirname "$0")/.." # Go to backend root

# Ensure we're using the virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the upgrade
flask db upgrade

echo "Migrations applied successfully."
