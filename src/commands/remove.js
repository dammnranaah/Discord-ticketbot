const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from the current ticket')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove from the ticket')
                .setRequired(true)),

    async execute(interaction) {
        const Ticket = db.getTicketModel();
        const ticket = await Ticket.findOne({ 
            where: {
                channelId: interaction.channel.id,
                status: 'OPEN'
            }
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
                content: '❌ Only the ticket owner or staff members can remove users!',
                ephemeral: true
            });
        }

        const userToRemove = interaction.options.getUser('user');

        if (userToRemove.id === ticket.ownerId) {
            return interaction.editReply({
                content: '❌ You cannot remove the ticket owner!',
                ephemeral: true
            });
        }

        if (!ticket.participants.includes(userToRemove.id)) {
            return interaction.editReply({
                content: '❌ This user is not in the ticket!',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.delete(userToRemove);

        await ticket.removeParticipant(userToRemove.id);

        await interaction.editReply({
            content: `✅ Successfully removed ${userToRemove} from the ticket!`,
            ephemeral: true
        });

        await interaction.channel.send(`${userToRemove} has been removed from the ticket by ${interaction.user}`);
    },
}; 