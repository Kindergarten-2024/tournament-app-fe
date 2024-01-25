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

#Stage 1: Building the React application
#Using a node image to build the React app
FROM node:20.11.0 AS build

#Set the working directory inside the container
WORKDIR /app

#Copy package.json and package-lock.json (if available) to the container
COPY package.json /app
COPY package-lock.json /app

#Install dependencies
RUN npm install

COPY nginx.conf /app
#Copy the rest of your app's source code from your host to your image filesystem.
COPY . /app

#Build the React application
RUN npm run build

#Stage 2: Setting up the Nginx server
#Using an Nginx image to serve the React app
FROM nginx

#Copy the React build from the 'build' stage to the Nginx server
COPY --from=build /app/build /usr/share/nginx/html

#Overwrite the default Nginx configuration with the custom one
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

#Expose port 80 to the outside once the container has launched
EXPOSE 80

#Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
