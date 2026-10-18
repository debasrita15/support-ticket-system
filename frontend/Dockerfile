# Stage 1: Build Angular frontend using Node.js
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve compiled SPA with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (mapped to 4200 in docker-compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
