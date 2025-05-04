require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./config/database');


const styles = {
    success: '\x1b[32m%s\x1b[0m',    
    info: '\x1b[36m%s\x1b[0m',      
    warning: '\x1b[33m%s\x1b[0m',   
    error: '\x1b[31m%s\x1b[0m',      
    highlight: '\x1b[35m%s\x1b[0m'   
};

console.log('\n' + '='.repeat(50));
console.log(styles.highlight, 'Discord Ticket Bot - Starting Up');
console.log('='.repeat(50) + '\n');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

console.log(styles.info, 'Loading commands...');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(styles.success, `   Loaded command: ${command.data.name}`);
    } else {
        console.log(styles.warning, `   Command at ${file} is missing required properties`);
    }
}

console.log(styles.info, '\nLoading events...');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
        console.log(styles.success, `   Loaded event (once): ${event.name}`);
    } else {
        client.on(event.name, (...args) => event.execute(...args));
        console.log(styles.success, `   Loaded event: ${event.name}`);
    }
}

async function start() {
    try {
        console.log(styles.info, '\nConnecting to database...');
        await db.connect();
        console.log(styles.success, `   Connected to ${db.dbType} database`);

        console.log(styles.info, '\nLogging in to Discord...');
        await client.login(process.env.BOT_TOKEN);
        console.log(styles.success, '   Bot is online!');

        console.log('\n' + '='.repeat(50));
        console.log(styles.highlight, 'Bot is ready!');
        console.log(styles.info, `   ${client.commands.size} commands loaded`);
        console.log(styles.info, `   ${eventFiles.length} events registered`);
        console.log(styles.info, `   Using ${db.dbType} database`);
        console.log('='.repeat(50) + '\n');
    } catch (error) {
        console.log(styles.error, '\nError starting bot:');
        console.error(error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log(styles.warning, '\nShutting down...');
    await db.disconnect();
    client.destroy();
    console.log(styles.success, 'Shutdown complete');
    process.exit(0);
});

start(); 