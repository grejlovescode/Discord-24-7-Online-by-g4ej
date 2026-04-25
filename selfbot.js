const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

// WARNING: This code violates Discord's Terms of Service
// Using self-bots can result in permanent account suspension
// Proceed with caution and at your own risk

console.log('WARNING: This code violates Discord Terms of Service!');
console.log('WARNING: Your account could be permanently banned!');
console.log('WARNING: Use at your own risk!');

const client = new Client({
    checkUpdate: false
});

// Self-bot configuration
const config = {
    token: process.env.DISCORD_USER_TOKEN, // User account token, NOT bot token
    status: 'online',
    activity: {
        name: 'Online 24/7',
        type: 0 // PLAYING
    },
    reconnectInterval: 5000,
    heartbeatInterval: 30000
};

let reconnectTimer;
let heartbeatTimer;

// Function to update status
function updateStatus() {
    try {
        client.user.setPresence({
            status: config.status,
            activities: [config.activity]
        });
        console.log('Status updated - Still online');
    } catch (error) {
        console.error('Status update failed:', error.message);
    }
}

// Heartbeat function
function heartbeat() {
    if (client.ready) {
        console.log('Heartbeat - Account online at:', new Date().toLocaleTimeString());
        updateStatus();
    }
}

// Connect to Discord
function connect() {
    console.log('Connecting user account...');
    
    client.login(config.token).catch(error => {
        console.error('Login failed:', error.message);
        if (error.message.includes('invalid')) {
            console.error('Invalid token! Check your DISCORD_USER_TOKEN');
        }
        scheduleReconnect();
    });
}

// Schedule reconnection
function scheduleReconnect() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
    }
    
    console.log('Reconnecting in', config.reconnectInterval / 1000, 'seconds...');
    reconnectTimer = setTimeout(() => {
        connect();
    }, config.reconnectInterval);
}

// Start heartbeat
function startHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }
    
    heartbeatTimer = setInterval(() => {
        heartbeat();
    }, config.heartbeatInterval);
}

// Event handlers
client.once('ready', () => {
    console.log('User account online:', client.user.tag + '!');
    console.log('In', client.guilds.cache.size, 'servers');
    console.log('Total friends:', client.relationships?.cache.size || 0);
    
    updateStatus();
    startHeartbeat();
});

client.on('disconnect', () => {
    console.log('Disconnected from Discord');
    scheduleReconnect();
});

client.on('reconnecting', () => {
    console.log('Reconnecting...');
});

client.on('error', (error) => {
    console.error('Client error:', error.message);
});

// Handle termination gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down self-bot...');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down...');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    client.destroy();
    process.exit(0);
});

// Start the self-bot
console.log('Starting Discord 24/7 Self-Bot...');
console.log('Remember: This violates Discord ToS!');
connect();
