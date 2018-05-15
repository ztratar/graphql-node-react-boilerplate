FROM node:boron

# Environment stuff
RUN	apt-key adv --keyserver pgp.mit.edu --recv D101F7899D41F3C3
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get -y update
RUN apt-get -y install yarn libpq-dev

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/ssl
WORKDIR /usr/src/app

# Copy compiled source
COPY dist/index.js /usr/src/app
COPY dist/index.js.map /usr/src/app
COPY ssl/** /usr/src/app/ssl/

# Install app dependencies
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn --production
RUN yarn add pg-native --save

CMD [ "node", "index.js" ]
