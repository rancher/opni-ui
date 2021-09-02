
FROM node:14

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json /app

# install project dependencies
RUN yarn install

COPY . /app

RUN ls

# build app for production with minification
RUN yarn build:opni

EXPOSE 80
CMD [ "yarn", "start:opni", "--spa" ]