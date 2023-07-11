# syntax=docker/dockerfile:1

FROM node:16-alpine
WORKDIR /car-booking

COPY package*.json ./
COPY . .

RUN npm install 
CMD ["node", "index.js"]
