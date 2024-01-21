# pull official base image
FROM node:20.11.0-bullseye as build


# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
COPY nginx.conf ./
RUN npm install

COPY . ./

RUN npm run build

FROM nginx
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html
