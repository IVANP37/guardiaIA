FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_OLLAMA_MODEL=gpt-oss:120b-cloud
ENV VITE_OLLAMA_MODEL=$VITE_OLLAMA_MODEL
ENV VITE_OLLAMA_BASE_URL=

RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache gettext
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
