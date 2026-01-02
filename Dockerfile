# Use Node 22 base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy server package files
COPY server/package.json server/package-lock.json ./server/

# Install dependencies (both root and server)
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Generate Prisma Client
RUN cd server && npx prisma generate

# Expose port 3000 (backend)
EXPOSE 3000

# Change directory to server for startup
WORKDIR /app/server

# Start server
CMD ["npm", "run", "start:prod"]
