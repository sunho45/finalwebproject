FROM node:22-alpine AS client-build
WORKDIR /app/client
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache nginx gettext

ENV API_PORT=4000

COPY server/package*.json ./server/
RUN npm --prefix server install --omit=dev
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
COPY nginx/render.conf.template /etc/nginx/templates/render.conf.template
COPY scripts/render-start.sh ./scripts/render-start.sh

RUN chmod +x ./scripts/render-start.sh

EXPOSE 10000
CMD ["./scripts/render-start.sh"]
