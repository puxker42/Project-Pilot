FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port (defaults to 5000 in env)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
