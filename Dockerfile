# Tahap 1: Build aplikasi React/Vite
FROM node:18-alpine AS builder

# Tentukan direktori kerja
WORKDIR /app

# Salin konfigurasi dependensi
COPY package*.json ./

# Install dependensi frontend
RUN npm install

# Salin seluruh kode frontend
COPY . .

# Build aplikasi untuk production
RUN npm run build

# Tahap 2: Sajikan file statis menggunakan NGINX
FROM nginx:alpine

# Salin hasil build dari tahap 1 ke folder publik NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# (Opsional) Salin konfigurasi NGINX khusus jika Anda memerlukannya untuk React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspos port default NGINX
EXPOSE 80

# Jalankan NGINX di latar depan
CMD ["nginx", "-g", "daemon off;"]
