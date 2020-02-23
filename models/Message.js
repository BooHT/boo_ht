
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MessageSchema = new Schema({
    senderId: String,
    messageText: String,
    attachmentUrl: String
});

module.exports = Message = mongoose.model('message', MessageSchema);