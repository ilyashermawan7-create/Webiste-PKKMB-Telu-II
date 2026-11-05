# ---------- Backend Laravel: PHP-FPM + Nginx + Supervisor dalam satu image ----------
FROM composer:2.8 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev

FROM php:8.3-fpm-alpine
RUN apk add --no-cache nginx supervisor icu-libs libpq libzip freetype libpng libjpeg-turbo \
    && apk add --no-cache --virtual .build $PHPIZE_DEPS icu-dev postgresql-dev libzip-dev freetype-dev libpng-dev libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql intl zip gd opcache pcntl bcmath \
    && pecl install redis && docker-php-ext-enable redis \
    && apk del .build

COPY docker/php.ini /usr/local/etc/php/conf.d/99-pkkmb.ini
COPY docker/www.conf /usr/local/etc/php-fpm.d/zz-pkkmb.conf
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

WORKDIR /var/www/html
COPY --from=vendor /app /var/www/html
RUN chmod +x /usr/local/bin/entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
