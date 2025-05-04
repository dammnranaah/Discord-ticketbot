const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close the current ticket'),

    async execute(interaction) {
        const Ticket = db.getTicketModel();
        const ticket = await Ticket.findOne({ 
            channelId: interaction.channel.id,
            status: 'OPEN'
        });

        if (!ticket) {
            return interaction.editReply({
                content: '❌ This command can only be used in an open ticket channel!',
                ephemeral: true
            });
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (ticket.ownerId !== interaction.user.id && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.editReply({
                content: '❌ Only the ticket owner or staff members can close the ticket!',
                ephemeral: true
            });
        }

        await interaction.editReply({
            content: '🔒 Closing ticket...',
            ephemeral: true
        });

        await ticket.closeTicket();

        await interaction.channel.send({
            content: `🔒 Ticket closed by ${interaction.user}\nThis channel will be deleted in 5 seconds.`
        });

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error deleting channel:', error);
            }
        }, 5000);
    },
}; 