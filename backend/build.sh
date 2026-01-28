#!/usr/bin/env bash
# build.sh for Django backend on Render

set -o errexit  # Exit on error

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate
