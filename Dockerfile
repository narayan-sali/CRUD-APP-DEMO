# Use the official Node.js image.
FROM node:18

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Install nodemon globally for development.
RUN npm install -g nodemon

# Copy the rest of the application code.
COPY . .

# Expose the port the app runs on.
EXPOSE 3000

# Use the dev script from package.json for development.
CMD [ "npm", "run", "dev" ]
