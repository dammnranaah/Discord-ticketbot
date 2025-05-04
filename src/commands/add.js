const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to the current ticket')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add to the ticket')
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
                content: '❌ Only the ticket owner or staff members can add users!',
                ephemeral: true
            });
        }

        const userToAdd = interaction.options.getUser('user');

        if (ticket.participants.includes(userToAdd.id)) {
            return interaction.editReply({
                content: '❌ This user is already in the ticket!',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(userToAdd, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        await ticket.addParticipant(userToAdd.id);

        await interaction.editReply({
            content: `✅ Successfully added ${userToAdd} to the ticket!`,
            ephemeral: true
        });

        await interaction.channel.send(`${userToAdd} has been added to the ticket by ${interaction.user}`);
    },
}; 