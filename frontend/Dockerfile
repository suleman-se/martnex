FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "run", "dev"]
