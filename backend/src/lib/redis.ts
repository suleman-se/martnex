import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL);

redis.on('error', (error) => {
  console.error('[Redis] Error:', error);
});

redis.on('connect', () => {
  console.log('[Redis] Connected to', REDIS_URL);
});

export default redis;
