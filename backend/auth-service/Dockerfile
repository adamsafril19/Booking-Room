FROM php:8.1-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    libzip-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip gd

# Install Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# Copy Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Laravel cache commands
RUN php artisan config:clear || true && \
    php artisan config:cache && \
    php artisan route:cache
    # && php artisan view:cache  <-- kalau kamu mau aktifkan nanti

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache


# Expose Nginx HTTP port
EXPOSE 80

# Start Nginx + PHP-FPM
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]

