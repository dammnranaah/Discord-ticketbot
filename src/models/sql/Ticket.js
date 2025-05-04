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
                const rawValue = this.getDataValue('participants');
                return Array.isArray(rawValue) ? rawValue : [];
            },
            set(value) {
                this.setDataValue('participants', Array.isArray(value) ? value : []);
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
        const currentParticipants = this.participants || [];
        if (!currentParticipants.includes(userId)) {
            this.participants = [...currentParticipants, userId];
            await this.save();
        }
        return this;
    };

    Ticket.prototype.removeParticipant = async function(userId) {
        const currentParticipants = this.participants || [];
        this.participants = currentParticipants.filter(id => id !== userId);
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