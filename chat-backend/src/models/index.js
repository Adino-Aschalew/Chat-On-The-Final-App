const sequelize = require('../config/database');

// Import all models
const User = require('./user.model');
const Chat = require('./chat.model');
const ChatMember = require('./chatMember.model');
const Message = require('./message.model');
const MessageRead = require('./messageRead.model');
const File = require('./file.model');
const DeviceToken = require('./deviceToken.model');
const MessageReaction = require('./messageReaction.model');
const Thread = require('./thread.model');
const Archive = require('./archive.model');
const MessageTranslation = require('./messageTranslation.model');
const ScheduledMessage = require('./scheduledMessage.model');
const Analytics = require('./analytics.model');
const SystemSetting = require('./systemSetting.model');

// Define associations

// User relationships
User.belongsToMany(Chat, { through: ChatMember, foreignKey: 'userId', otherKey: 'chatId' });
User.hasMany(ChatMember, { foreignKey: 'userId', as: 'chatMemberships' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(MessageRead, { foreignKey: 'userId', as: 'messageReads' });
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
User.hasMany(DeviceToken, { foreignKey: 'userId', as: 'deviceTokens' });
User.hasMany(MessageReaction, { foreignKey: 'userId', as: 'reactions' });
User.hasMany(Thread, { foreignKey: 'createdBy', as: 'createdThreads' });
User.hasMany(Archive, { foreignKey: 'archivedBy', as: 'archives' });
User.hasMany(ScheduledMessage, { foreignKey: 'senderId', as: 'scheduledMessages' });
User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics' });

// Chat relationships
Chat.belongsToMany(User, { through: ChatMember, foreignKey: 'chatId', otherKey: 'userId' });
Chat.hasMany(ChatMember, { foreignKey: 'chatId', as: 'members' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Chat.hasMany(Thread, { foreignKey: 'chatId', as: 'threads' });
Chat.hasMany(Archive, { foreignKey: 'chatId', as: 'archives' });
Chat.hasMany(ScheduledMessage, { foreignKey: 'chatId', as: 'scheduledMessages' });
Chat.hasMany(Analytics, { foreignKey: 'chatId', as: 'analytics' });
Chat.belongsTo(Message, { foreignKey: 'pinnedMessageId', as: 'pinnedMessage' });

// ChatMember relationships
ChatMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ChatMember.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

// Message relationships
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'forwardedFromId', as: 'forwardedFrom' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });
Message.hasMany(Message, { foreignKey: 'replyToId', as: 'replies' });
Message.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });
Message.hasMany(MessageRead, { foreignKey: 'messageId', as: 'reads' });
Message.hasMany(MessageReaction, { foreignKey: 'messageId', as: 'reactions' });
Message.hasMany(MessageTranslation, { foreignKey: 'messageId', as: 'translations' });
Message.hasOne(Thread, { foreignKey: 'messageId', as: 'threadRoot' });

// MessageRead relationships
MessageRead.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
MessageRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// File relationships
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// DeviceToken relationships
DeviceToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// MessageReaction relationships
MessageReaction.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
MessageReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Thread relationships
Thread.belongsTo(Message, { foreignKey: 'messageId', as: 'rootMessage' });
Thread.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Thread.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Thread.hasMany(Message, { foreignKey: 'threadId', as: 'messages' });

// Archive relationships
Archive.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Archive.belongsTo(User, { foreignKey: 'archivedBy', as: 'archiver' });

// MessageTranslation relationships
MessageTranslation.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

// ScheduledMessage relationships
ScheduledMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
ScheduledMessage.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
ScheduledMessage.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

// Analytics relationships
Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Analytics.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

// Export all models and sequelize instance
const db = {
  sequelize,
  User,
  Chat,
  ChatMember,
  Message,
  MessageRead,
  File,
  DeviceToken,
  MessageReaction,
  Thread,
  Archive,
  MessageTranslation,
  ScheduledMessage,
  Analytics,
  SystemSetting
};

module.exports = db;
