# --- Build Stage ---
FROM node:24.15-alpine AS build

WORKDIR /app

# Accept VITE_API_URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# --- Production Stage ---
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
# Use .template to allow environment variable substitution (like $PORT)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# --- Development Stage ---
FROM node:24.15-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
