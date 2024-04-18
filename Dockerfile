# Build stage
FROM node:20.10.0-alpine as builder

RUN npm i -g @nestjs/cli typescript ts-node

WORKDIR /tmp/app
COPY package*.json ./
RUN npm install

WORKDIR /usr/src/app
COPY . .
RUN cp -a /tmp/app/node_modules .
RUN if [ ! -f .env ]; then cp .env.example .env; fi
RUN npm run build

# Run stage
FROM node:20.10.0-alpine

RUN apk add --no-cache bash curl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.env ./
COPY --from=builder /usr/src/app/bash/wait-for-it.sh /opt/wait-for-it.sh
COPY --from=builder /usr/src/app/bash/startup.dev.sh /opt/startup.dev.sh

RUN chmod +x /opt/wait-for-it.sh /opt/startup.dev.sh

CMD ["/opt/startup.dev.sh"]