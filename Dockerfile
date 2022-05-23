FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN chmod 777 ./cputil-linux-x64/cputil

RUN npm install -g nodemon && npm install

COPY . .

EXPOSE 3001

CMD ["node", "bin/www"]