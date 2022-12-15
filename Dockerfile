FROM node:16

ADD . /app
WORKDIR /app

ENV NODE_ENV production
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}

CMD node build/index.js
