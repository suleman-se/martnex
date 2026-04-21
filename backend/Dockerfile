FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy project files
COPY . .

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Expose ports
# 9001 - API
# 7001 - Admin Panel
EXPOSE 9001 7001

# Run migrations then start server
ENTRYPOINT ["/app/entrypoint.sh"]