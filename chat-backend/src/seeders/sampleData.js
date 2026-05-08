const { User, Chat, ChatMember, Message } = require('../models');
const { logger } = require('../middleware/error.middleware');
const bcrypt = require('bcryptjs');

const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'USER'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'USER'
  },
  {
    username: 'bob_wilson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'USER'
  },
  {
    username: 'alice_brown',
    email: 'alice@example.com',
    password: 'password123',
    role: 'USER'
  },
  {
    username: 'charlie_davis',
    email: 'charlie@example.com',
    password: 'password123',
    role: 'USER'
  }
];

const sampleChats = [
  {
    name: 'General Discussion',
    type: 'GROUP',
    description: 'A place for general conversations'
  },
  {
    name: 'Tech Talk',
    type: 'CHANNEL',
    description: 'Discuss technology and programming'
  },
  {
    name: 'Random',
    type: 'GROUP',
    description: 'Random conversations and fun'
  }
];

const sampleMessages = [
  'Hey everyone! How\'s it going?',
  'Welcome to the chat! 👋',
  'Anyone working on something interesting?',
  'Just deployed a new feature today!',
  'Looking forward to the weekend',
  'Has anyone tried the new framework?',
  'Coffee is essential for coding ☕',
  'Great discussion today!',
  'Thanks for the help!',
  'Have a great day everyone!'
];

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isOnline: Math.random() > 0.5,
        presenceStatus: ['ONLINE', 'AWAY', 'BUSY'][Math.floor(Math.random() * 3)]
      });
      createdUsers.push(user);
      console.log(`Created user: ${user.username} (${user.email})`);
    }

    // Create sample chats
    const createdChats = [];
    for (const chatData of sampleChats) {
      const chat = await Chat.create({
        ...chatData,
        memberCount: createdUsers.length
      });
      createdChats.push(chat);
      console.log(`Created chat: ${chat.name}`);
    }

    // Add users to chats
    for (const chat of createdChats) {
      for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        await ChatMember.create({
          userId: user.id,
          chatId: chat.id,
          role: i === 0 ? 'ADMIN' : 'MEMBER',
          lastReadAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
        });
      }
      console.log(`Added ${createdUsers.length} users to chat: ${chat.name}`);
    }

    // Create sample messages
    for (const chat of createdChats) {
      const messageCount = Math.floor(Math.random() * 20) + 10; // 10-30 messages per chat
      
      for (let i = 0; i < messageCount; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        // Create timestamp with some randomness
        const timestamp = new Date(Date.now() - (messageCount - i) * 30 * 60 * 1000 + Math.random() * 30 * 60 * 1000);
        
        await Message.create({
          chatId: chat.id,
          senderId: randomUser.id,
          content: randomMessage,
          messageType: 'TEXT',
          isDelivered: true,
          deliveredAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      
      // Update chat's last message time
      await chat.update({
        lastMessageAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000) // Random time in last hour
      });
      
      console.log(`Created ${messageCount} messages for chat: ${chat.name}`);
    }

    // Create some private chats
    for (let i = 0; i < createdUsers.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 2, createdUsers.length); j++) {
        const privateChat = await Chat.create({
          type: 'PRIVATE',
          memberCount: 2
        });

        // Add both users to private chat
        await ChatMember.create({
          userId: createdUsers[i].id,
          chatId: privateChat.id,
          role: 'MEMBER',
          lastReadAt: new Date()
        });

        await ChatMember.create({
          userId: createdUsers[j].id,
          chatId: privateChat.id,
          role: 'MEMBER',
          lastReadAt: new Date()
        });

        // Add a few messages to private chat
        const privateMessageCount = Math.floor(Math.random() * 5) + 2;
        for (let k = 0; k < privateMessageCount; k++) {
          const sender = k % 2 === 0 ? createdUsers[i] : createdUsers[j];
          const content = `Private message ${k + 1} between ${createdUsers[i].username} and ${createdUsers[j].username}`;
          
          await Message.create({
            chatId: privateChat.id,
            senderId: sender.id,
            content,
            messageType: 'TEXT',
            isDelivered: true,
            deliveredAt: new Date()
          });
        }

        await privateChat.update({
          lastMessageAt: new Date()
        });

        console.log(`Created private chat between ${createdUsers[i].username} and ${createdUsers[j].username}`);
      }
    }

    console.log('\n✅ Sample data created successfully!');
    console.log('\nCreated:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdChats.length} group/channel chats`);
    console.log(`- ${sampleUsers.length * 2} private chats`);
    console.log(`- Multiple messages in each chat`);
    
    console.log('\n📝 Login credentials:');
    console.log('All users have password: password123');
    sampleUsers.forEach(user => {
      console.log(`- ${user.username}: ${user.email}`);
    });

    logger.info('Sample data created successfully');

  } catch (error) {
    console.error('Error creating sample data:', error);
    logger.error('Error creating sample data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seeder
createSampleData();
