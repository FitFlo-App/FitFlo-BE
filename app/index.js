require('dotenv').config();

const mongodb = require('./configs/database/mongodb/mongodb.client');
mongodb.connectDB();

const redisClient = require('./configs/cache/redis/redis.client').client;
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Failed to connect to Redis:', err));

const iris = require('./configs/database/iris/iris.client');
const irisConnection = iris.connect();
if (irisConnection) {
  const irisTable = iris.readTable();
  if (!irisTable) {
    const createIrisTable = iris.createTable();
    if (createIrisTable) {
      iris.loadTable();
    }
  }
}

const transformers = require('./utils/nlp/xenova/transformers');
transformers.loadModel("Xenova/all-MiniLM-L6-v2");

const app = require('./server');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});