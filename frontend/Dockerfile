FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies at BUILD time so node_modules are baked into the image.
# The docker-compose named volume will preserve these on first mount.
RUN pnpm install --frozen-lockfile

EXPOSE 3000

# Run the dev server (source is live-mounted via docker-compose volume)
CMD ["pnpm", "run", "dev"]
