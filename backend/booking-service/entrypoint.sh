#!/bin/sh

# Start PHP-FPM in background
php-fpm &

# Start nginx in foreground (this will keep container alive)
nginx -g "daemon off;"
