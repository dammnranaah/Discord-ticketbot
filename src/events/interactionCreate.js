const { Events } = require('discord.js');

const styles = {
    success: '\x1b[32m%s\x1b[0m',    
    info: '\x1b[36m%s\x1b[0m',       
    warning: '\x1b[33m%s\x1b[0m',    
    error: '\x1b[31m%s\x1b[0m',     
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.log(styles.warning, `Command not found: ${interaction.commandName}`);
                    return;
                }

                console.log(styles.info, `Command used: ${interaction.commandName} by ${interaction.user.tag}`);

                if (['new', 'close', 'add', 'remove'].includes(interaction.commandName)) {
                    await interaction.deferReply({ ephemeral: true });
                }

                try {
                    await command.execute(interaction);
                    console.log(styles.success, `Command completed: ${interaction.commandName}`);
                } catch (error) {
                    console.log(styles.error, `Command error: ${interaction.commandName}`);
                    console.error(error);
                    const errorMessage = 'There was an error executing this command!';
                    
                    if (interaction.deferred) {
                        await interaction.editReply({
                            content: errorMessage,
                            ephemeral: true
                        });
                    } else if (!interaction.replied) {
                        await interaction.reply({
                            content: errorMessage,
                            ephemeral: true
                        });
                    }
                }
            } else if (interaction.isButton()) {
                if (interaction.customId === 'create_ticket') {
                    console.log(styles.info, `Button clicked: create_ticket by ${interaction.user.tag}`);
                    
                    await interaction.deferReply({ ephemeral: true });
                    
                    const newTicketCommand = interaction.client.commands.get('new');
                    if (newTicketCommand) {
                        try {
                            await newTicketCommand.execute(interaction);
                            console.log(styles.success, `Ticket created for ${interaction.user.tag}`);
                        } catch (error) {
                            console.log(styles.error, `Error creating ticket for ${interaction.user.tag}`);
                            console.error('Error details:', error);
                            await interaction.editReply({
                                content: 'There was an error creating your ticket!',
                                ephemeral: true
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.log(styles.error, 'Interaction error:');
            console.error(error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'There was an error processing your request!',
                        ephemeral: true
                    });
                }
            } catch (e) {
                console.log(styles.error, 'Error sending error response:');
                console.error(e);
            }
        }
    },
}; 