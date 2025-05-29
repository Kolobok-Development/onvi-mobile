FROM --platform=linux/amd64 node:20-slim

WORKDIR /usr/src/app

# Установка curl, git, и других утилит (если нужно), с безопасной обработкой зеркал
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl git && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --save

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:prod" ]