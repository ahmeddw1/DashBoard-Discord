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
    GatewayIntentBits.GuildMembers
  ]
});

// Login using ENV variable
client.login(process.env.BOT_TOKEN);

// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {
    const online = client.isReady();

    const servers = client.guilds.cache.size;

    let totalUsers = 0;
    client.guilds.cache.forEach(guild => {
      totalUsers += guild.memberCount;
    });

    const serverList = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      members: guild.memberCount
    }));

    res.json({
      online,
      servers,
      users: totalUsers,
      commands: 0,
      serverList
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
