FROM --platform=linux/amd64 node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps --save

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:prod" ]