# Gunakan Node.js versi ringan
FROM node:18-alpine

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin file konfigurasi npm terlebih dahulu agar bisa dicache oleh Docker
COPY package*.json ./

# Install dependensi (termasuk natural, bcryptjs, mongoose, dll)
RUN npm install

# Salin seluruh kode backend ke dalam container
COPY . .

# Ekspos port backend
EXPOSE 5000

# Perintah untuk menjalankan server
CMD ["npm", "start"]
