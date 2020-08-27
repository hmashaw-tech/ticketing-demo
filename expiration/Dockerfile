FROM node:alpine

RUN apk add bash && \
    apk add curl

RUN addgroup --gid 2000 demogrp && \
    adduser --disabled-password --uid 2000 --ingroup demogrp --home /home/demouser --shell /sbin/sh --gecos "Demo User" demouser && \
    chown -R demouser:demogrp /home/demouser

WORKDIR /app
COPY package.json .
RUN npm install --only=prod

COPY . .
RUN chown -R demouser:demogrp src

USER demouser

CMD ["npm", "start"]
