# --- Build Stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production Stage (Nginx) ---
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# We'll need a custom nginx config to handle SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# --- Development Stage ---
FROM node:20-slim AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Start Vite with --host so it's accessible from the container network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
