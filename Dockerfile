FROM oraclelinux:7-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN yum update -y && \
    yum install -y oracle-release-el7 && \
    yum install -y gcc gcc-c++ kernel-devel make && \
    yum install -y oracle-nodejs-release-el7 && \
    yum install -y nodejs && \
    yum install -y python3 && \
    yum install -y oracle-instantclient19.10-basic && \
    yum clean all && \
    node --version && \
    npm --version && \
    echo Installed

RUN npm install --save

RUN npm link webpack

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:prod" ]