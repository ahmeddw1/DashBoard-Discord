require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, ActivityType, Status } = require('discord.js');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 1. Setup Client with necessary Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences // Required to count online members
  ],
  // 2. Fix: Set status to IDLE immediately on startup
  presence: {
    status: 'idle',
    activities: [{
      name: '🌐 24/7 | Works',
      type: ActivityType.Listening
    }]
  }
});

// ---------- DASHBOARD API ----------

app.get('/api/dashboard', async (req, res) => {
  try {
    if (!client.isReady()) {
      return res.status(503).json({ error: 'Bot is starting up...' });
    }

    const guilds = client.guilds.cache;
    let totalUsers = 0;

    const serverList = guilds.map(guild => {
      totalUsers += guild.memberCount;

      // 3. Fix: Calculate Online Members
      // Filters cache for members that are NOT offline
      const onlineCount = guild.members.cache.filter(m => 
        m.presence?.status === 'online' || 
        m.presence?.status === 'idle' || 
        m.presence?.status === 'dnd'
      ).size;

      // 4. Fix: Generate full Icon URL
      const iconURL = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

      return {
        id: guild.id,
        name: guild.name,
        members: guild.memberCount,
        online: onlineCount,
        icon: iconURL
      };
    });

    res.json({
      online: true,
      servers: guilds.size,
      users: totalUsers,
      serverList: serverList
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------- BOT EVENTS ----------

client.on('ready', () => {
  console.log('=================================');
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🌙 Status: ${client.user.presence.status}`);
  console.log(`🌐 API: http://localhost:${PORT}/api/dashboard`);
  console.log('=================================');
});

// Login
client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`🚀 Web server running on port ${PORT}`);
});
