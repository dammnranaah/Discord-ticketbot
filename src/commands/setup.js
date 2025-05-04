const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sets up the ticket system panel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the ticket panel to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket System')
            .setDescription('Need assistance? Click the button below to create a support ticket.')
            .setColor('#2196f3')
            .setFooter({ text: 'Support Ticket System' })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: `Ticket panel has been set up in ${channel}!`,
            ephemeral: true
        });
    },
}; 