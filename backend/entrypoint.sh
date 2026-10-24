#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

if [ "${SKIP_SEED:-false}" != "true" ]; then
  echo "Seeding database with January 2026 Elexon data..."
  python manage.py seed_january_data
else
  echo "Skipping seed (SKIP_SEED=true)."
fi

PORT="${PORT:-8000}"
WORKERS="${GUNICORN_WORKERS:-2}"

echo "Starting Gunicorn on 0.0.0.0:${PORT}..."
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WORKERS}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
