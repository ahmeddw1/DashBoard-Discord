require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences // ✅ ADDED
  ]
});

// Login using ENV variable
client.login(process.env.BOT_TOKEN);

// ✅ Fetch all members when bot is ready
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    await guild.members.fetch(); // cache members for presence check
  }
});

// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {

    const status = client.isReady() ? "online" : "offline";
    const servers = client.guilds.cache.size;

    let totalUsers = 0;
    let totalOnline = 0;
    let totalOffline = 0;

    client.guilds.cache.forEach(guild => {
      totalUsers += guild.memberCount;

      guild.members.cache.forEach(member => {
        if (!member.presence || member.presence.status === "offline") {
          totalOffline++;
        } else {
          totalOnline++;
        }
      });
    });

    const serverList = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      members: guild.memberCount,
      icon: guild.iconURL({ dynamic: true, size: 128 }) || null
    }));

    res.json({
      status,
      servers,
      users: totalUsers,
      totalOnline,     // ✅ ADDED
      totalOffline,    // ✅ ADDED
      commands: 0,
      serverList
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
