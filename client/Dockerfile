FROM node:alpine

RUN apk add bash && \
    apk add curl

RUN addgroup --gid 2000 demogrp && \
    adduser --disabled-password --uid 2000 --ingroup demogrp --home /home/demouser --shell /sbin/sh --gecos "Demo User" demouser && \
    chown -R demouser:demogrp /home/demouser

WORKDIR /app

RUN mkdir .next && chown -R demouser:demogrp .next

COPY package.json .
RUN npm install

COPY . .
RUN chown -R demouser:demogrp next.config.js pages api components hooks

USER demouser

CMD ["npm", "run", "dev"]
