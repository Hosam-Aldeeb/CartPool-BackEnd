FROM node:19-alpine3.16

ENV TZ=EST

EXPOSE 3000

WORKDIR /cartpool

COPY . /cartpool/

RUN npm install

RUN npm install --save express

ENV NODE_TLS_REJECT_UNAUTHORIZED='0'

CMD node ./src/server.js