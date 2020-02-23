
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MessageSchema = new Schema({
    senderId: String,
    recipientId: String,
    timestamp: Number,
    messageText: String
});

module.exports = Message = mongoose.model('message', MessageSchema);