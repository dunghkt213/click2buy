const { Kafka } = require('kafkajs');

// Test script để emit notification qua Kafka
async function testNotification() {
  const kafka = new Kafka({
    clientId: 'test-notification',
    brokers: ['localhost:19092']
  });

  const producer = kafka.producer();

  try {
    await producer.connect();

    // Test emit noti.create event
    const notification = {
      userId: '691714bb58ee7cb288691893', // User ID từ log
      title: 'Test Notification',
      content: 'Đây là notification test từ Kafka',
      type: 'SYSTEM',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    await producer.send({
      topic: 'noti.create',
      messages: [
        {
          value: JSON.stringify(notification)
        }
      ]
    });

    console.log('✅ Test notification sent:', notification);

  } catch (error) {
    console.error('❌ Error sending test notification:', error);
  } finally {
    await producer.disconnect();
  }
}

testNotification();
