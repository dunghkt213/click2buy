/**
 * Configuration factory for environment variables
 */
export default () => ({
  port: parseInt(process.env.PORT || '3004', 10),
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/cart_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    clientId: process.env.KAFKA_CLIENT_ID || 'cart-service',
    groupId: process.env.KAFKA_GROUP_ID || 'cart-service-group',
  },
});
