require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Required for member lists
    GatewayIntentBits.GuildPresences // Required for Online/Offline status
  ],
  presence: {
    status: 'idle', // Starts as idle (yellow moon)
    activities: [{ 
      name: '🌐 24/7 | Works', 
      type: ActivityType.Listening 
    }]
  }
});

// ---------- DASHBOARD API ----------

// GET: Fetch all server data, online/offline counts, and icons
app.get('/api/dashboard', async (req, res) => {
  try {
    if (!client.isReady()) {
      return res.status(503).json({ error: 'Bot is starting up...' });
    }

    const guilds = client.guilds.cache;
    let totalUsers = 0;

    const serverList = guilds.map(guild => {
      totalUsers += guild.memberCount;

      // Filter members based on presence status
      const onlineMembers = guild.members.cache.filter(m => 
        m.presence?.status === 'online' || 
        m.presence?.status === 'idle' || 
        m.presence?.status === 'dnd'
      ).size;

      const offlineMembers = guild.memberCount - onlineMembers;

      // Construct Icon URL
      const iconURL = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

      return {
        id: guild.id,
        name: guild.name,
        total: guild.memberCount,
        online: onlineMembers,
        offline: offlineMembers,
        icon: iconURL
      };
    });

    res.json({
      status: client.user.presence.status,
      servers: guilds.size,
      users: totalUsers,
      serverList: serverList
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Change Bot Status from Dashboard Settings
app.post('/api/settings/status', async (req, res) => {
  try {
    const { status, type, name } = req.body;

    const activityTypes = {
      "PLAYING": ActivityType.Playing,
      "STREAMING": ActivityType.Streaming,
      "LISTENING": ActivityType.Listening,
      "WATCHING": ActivityType.Watching
    };

    client.user.setPresence({
      status: status || 'online',
      activities: [{
        name: name || 'Works',
        type: activityTypes[type] || ActivityType.Playing
      }]
    });

    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error('Settings Error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ---------- BOT READY ----------

client.on('ready', () => {
  console.log('=================================');
  console.log(`✅ Logged in as: ${client.user.tag}`);
  console.log(`🌙 Bot Status: ${client.user.presence.status}`);
  console.log(`🚀 API running on port: ${PORT}`);
  console.log('=================================');
});

// Login using your Token from .env
client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`Web server listening at http://localhost:${PORT}`);
});
