require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// 1. Setup Client with Intents and Idle Status
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences 
  ],
  presence: {
    status: 'idle', // This ensures the bot shows the yellow moon immediately
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
      return res.status(503).json({ error: 'Bot is still connecting...' });
    }

    const guilds = client.guilds.cache;
    let totalGlobalUsers = 0;

    const serverList = guilds.map(guild => {
      totalGlobalUsers += guild.memberCount;

      // 2. Fix: Count Online vs Offline Members
      // We filter the cache for anyone who isn't 'offline'
      const onlineCount = guild.members.cache.filter(m => 
        m.presence?.status === 'online' || 
        m.presence?.status === 'idle' || 
        m.presence?.status === 'dnd'
      ).size;

      // Offline is Total - (Online/Idle/DND)
      const offlineCount = guild.memberCount - onlineCount;

      // 3. Fix: Generate full Icon URL
      const iconURL = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

      return {
        id: guild.id,
        name: guild.name,
        totalMembers: guild.memberCount,
        onlineMembers: onlineCount,
        offlineMembers: offlineCount,
        icon: iconURL
      };
    });

    res.json({
      botStatus: "idle",
      totalServers: guilds.size,
      totalUsers: totalGlobalUsers,
      serverList: serverList
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------- STARTUP ----------

client.on('ready', () => {
  console.log('=================================');
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🌙 Status: IDLE`);
  console.log(`🔗 API: http://localhost:${PORT}/api/dashboard`);
  console.log('=================================');
});

client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`🚀 Web Server active on port ${PORT}`);
});
