FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

EXPOSE 5173

# Default command with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
