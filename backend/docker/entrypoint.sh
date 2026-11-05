#!/bin/sh
set -e
cd /var/www/html

# Platform seperti Render membuat APP_KEY acak tanpa format Laravel ("base64:" + 32 byte).
# Turunkan kunci 32 byte yang stabil dari nilai tersebut bila perlu.
case "${APP_KEY:-}" in
  base64:*) ;;
  "") echo "APP_KEY belum diisi" >&2; exit 1 ;;
  *) APP_KEY="base64:$(php -r 'echo base64_encode(hash("sha256", getenv("APP_KEY"), true));')"; export APP_KEY ;;
esac
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
