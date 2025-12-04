# ---------- Build stage ----------
FROM node:18-alpine AS build
# Security: keep packages updated
RUN apk update && apk upgrade

# Create app directory
WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# IMPORTANT: In CI, React treats warnings as errors if CI=true.
# Disable that so builds don't fail just because of warnings.
ENV CI=false

# Build the React app (output goes to /app/build)
RUN npm run build

# ---------- Runtime (Nginx) stage ----------
FROM nginx:stable-alpine

# Remove default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx config (must exist in this folder)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the build stage
# NOTE: Create React App outputs to /app/build, NOT /app/dist
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]