FROM node

COPY ./sharepad-service /sharepad-service

WORKDIR /sharepad-service

RUN npm install

COPY ./sharepad-web /sharepad-web

CMD [ "node", "." ]