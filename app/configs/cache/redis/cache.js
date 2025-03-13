const redis = require('redis');

const client = redis.createClient({ url: process.env.REDIS_URI });

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

module.exports = {
    redis,
    client
}