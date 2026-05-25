FROM php:8.2-apache

# Cài đặt extension PDO MySQL cần thiết cho CSDL
RUN docker-php-ext-install pdo pdo_mysql

# Kích hoạt mod_rewrite của Apache phục vụ cho Routing MVC
RUN a2enmod rewrite

# Định cấu hình DocumentRoot trỏ vào thư mục backend/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Cấu hình Apache lắng nghe theo biến cổng động $PORT từ Render
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Copy toàn bộ mã nguồn dự án vào container
COPY . /var/www/html/

# Cấp quyền sở hữu thư mục cho user www-data của Apache
RUN chown -R www-data:www-data /var/www/html

# Mở cổng 80 (cổng tượng trưng, Render sẽ tự động gán $PORT)
EXPOSE 80

# Chạy Apache Web Server
CMD ["apache2-foreground"]
