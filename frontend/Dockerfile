FROM node:18-alpine

WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install dependencies strictly from the recipe
# Added --legacy-peer-deps to handle potential version conflicts common in older react setups
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Environment variable for the API URL
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

EXPOSE 3000

# Run in Development Mode
CMD ["npm", "start"]
