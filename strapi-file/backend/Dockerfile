FROM node:22-alpine AS build
# Install build dependencies for sharp/libvips and other native node modules
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --legacy-peer-deps

WORKDIR /opt/app
COPY . .
RUN mkdir -p /opt/node_modules/@strapi/typescript-utils/tsconfigs \
  && chown -R node:node /opt/app /opt/node_modules
USER node
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache vips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules

WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV PATH=/opt/node_modules/.bin:$PATH

RUN mkdir -p /opt/app/node_modules/.strapi \
  && mkdir -p /opt/node_modules/@strapi/typescript-utils/tsconfigs \
  && chown -R node:node /opt/app /opt/node_modules
USER node

EXPOSE 1337
CMD ["npm", "run", "develop"]
