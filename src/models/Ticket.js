const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    ownerId: {
        type: String,
        required: true
    },
    participants: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Ticket', ticketSchema); 