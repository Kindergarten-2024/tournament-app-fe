# # pull official base image
# FROM node:18 as build


# # set working directory
# WORKDIR /app

# # add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# # Copy package.json and package-lock.json to the working directory
# COPY package.json ./
# COPY package-lock.json ./
# #install depencencies
# RUN npm install 
# COPY nginx.conf ./

# # Copy the entire application code to the container
# COPY . .
# #build the react app 
# RUN npm run build

# FROM nginx

# COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

# COPY --from=build /app/build /usr/share/nginx/html

FROM node:18.18.2-alpine AS prod

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/local/bin

#COPY --from=prod /app/build /usr/share/nginx/html


COPY --from=prod /app/nginx.conf /etc/nginx/nginx.conf

COPY --from=prod /app/build /usr/share/nginx/html

EXPOSE 80

