const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Ticket = sequelize.define('Ticket', {
        channelId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        ownerId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        participants: {
            type: DataTypes.JSON, 
            defaultValue: [],
            get() {
                const value = this.getDataValue('participants');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('participants', JSON.stringify(value));
            }
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED'),
            defaultValue: 'OPEN'
        },
        closedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        indexes: [
            {
                fields: ['channelId']
            },
            {
                fields: ['ownerId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['ownerId', 'status']
            }
        ]
    });

    Ticket.prototype.addParticipant = async function(userId) {
        const participants = this.participants;
        if (!participants.includes(userId)) {
            participants.push(userId);
            this.participants = participants;
            await this.save();
        }
        return this;
    };

    Ticket.prototype.removeParticipant = async function(userId) {
        const participants = this.participants.filter(id => id !== userId);
        this.participants = participants;
        await this.save();
        return this;
    };

    Ticket.prototype.closeTicket = async function() {
        this.status = 'CLOSED';
        this.closedAt = new Date();
        await this.save();
        return this;
    };

    return Ticket;
}; 