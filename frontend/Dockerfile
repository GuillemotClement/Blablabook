# # Dockerfile for the Vite/React frontend

# # Use Node.js 20 Alpine as a lightweight base image
# FROM node:20-alpine AS build

# # Set working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json (if exists) to install dependencies
# COPY package.json package-lock.json* ./

# # Install all dependencies
# RUN npm install

# # Copy the rest of the frontend source code into the container
# COPY . .

# # Build the frontend (Vite) for production
# RUN npm run build


# # Build stage
# FROM node:20-alpine AS build

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npm run build


# # Runtime stage
# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]