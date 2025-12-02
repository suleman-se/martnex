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

# Expose ports
# 9001 - API
# 7001 - Admin Panel
EXPOSE 9001 7001

# Start development server
CMD ["pnpm", "run", "dev"]