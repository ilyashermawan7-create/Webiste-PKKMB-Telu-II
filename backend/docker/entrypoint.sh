#!/bin/sh
set -e
cd /var/www/html
# Hanya container "app" (ROLE=app) yang menjalankan migrasi & cache konfigurasi
if [ "${CONTAINER_ROLE:-app}" = "app" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan storage:link >/dev/null 2>&1 || true
  if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then php artisan migrate --force; fi
  if [ "${SEED_DEMO:-false}" = "true" ]; then php artisan db:seed --force; fi
fi
exec "$@"
