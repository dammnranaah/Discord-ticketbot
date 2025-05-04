const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        unique: true,
        index: true 
    },
    ownerId: {
        type: String,
        required: true,
        index: true 
    },
    participants: [{
        type: String,
        index: true 
    }],
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN',
        index: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true 
    },
    closedAt: {
        type: Date,
        sparse: true 
    }
}, {
    timestamps: true 
});

ticketSchema.index({ ownerId: 1, status: 1 });
ticketSchema.index({ channelId: 1, status: 1 });

ticketSchema.methods.addParticipant = async function(userId) {
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
        await this.save();
    }
    return this;
};

ticketSchema.methods.removeParticipant = async function(userId) {
    this.participants = this.participants.filter(id => id !== userId);
    await this.save();
    return this;
};

ticketSchema.methods.closeTicket = async function() {
    this.status = 'CLOSED';
    this.closedAt = new Date();
    await this.save();
    return this;
};

module.exports = mongoose.model('Ticket', ticketSchema); 