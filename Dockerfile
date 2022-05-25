FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install -g nodemon && npm install

COPY . .

RUN chmod 777 ./cputil-linux-x64/cputil

EXPOSE 3001

CMD ["node", "bin/www"]