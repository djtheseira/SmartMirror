FROM node:10.3-alpine

ENV HOME=/home/app

RUN mkdir -p $HOME/SmartMirror/src
COPY package.json $HOME/SmartMirror/src/
# COPY .env $HOME/SmartMirror/

WORKDIR $HOME/SmartMirror/src
RUN npm install

RUN addgroup -S app &&\
  adduser -S -D -h /bin/false app -G app
  # npm init -y &&\
  # yarn install --no-cache
  # yarn init -y &&\

# RUN cd /tmp && yarn

RUN chown -R app:app $HOME/*

# RUN npm install --no-cache
RUN ls -l /home/app/SmartMirror/

USER app

CMD ["node", "app.js"]