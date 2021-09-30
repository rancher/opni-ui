
FROM node:14

WORKDIR /app

COPY package*.json /app
COPY yarn.lock /app
COPY . /app

RUN yarn install
RUN yarn opni:build

EXPOSE 80
CMD [ "yarn", "opni:start", "--spa" ]