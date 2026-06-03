FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared ./shared
COPY gateway ./gateway
COPY services ./services
COPY scripts ./scripts

RUN npm install

EXPOSE 5000 5001 5002 5003 5004 5005

CMD ["npm", "start"]
