const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Creates a new support ticket'),

    async execute(interaction) {
        const Ticket = db.getTicketModel();
        const existingTicket = await Ticket.findOne({
            ownerId: interaction.user.id,
            status: 'OPEN'
        });

        if (existingTicket) {
            return interaction.editReply({
                content: '❌ You already have an open ticket!',
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
                {
                    id: interaction.client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels,
                    ],
                },
            ],
        });

        const ticket = await Ticket.create({
            channelId: channel.id,
            ownerId: interaction.user.id,
            participants: [interaction.user.id]
        });

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket')
            .setDescription(`Welcome ${interaction.user}! Please describe your issue and wait for a staff member to assist you.`)
            .setColor('#2196f3')
            .setTimestamp()
            .setFooter({ text: `Ticket ID: ${channel.id}` });

        await channel.send({ embeds: [embed] });

        await interaction.editReply({
            content: `✅ Your ticket has been created in ${channel}`,
            ephemeral: true
        });
    },
}; 