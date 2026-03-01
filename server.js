require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🌐 Servers: ${client.guilds.cache.size}`);
});

app.get('/api/dashboard', (req, res) => {

  if (!client.isReady()) {
    return res.json({
      status: "offline",
      servers: 0,
      users: 0,
      totalOnline: 0,
      totalOffline: 0,
      commands: 0,
      serverList: []
    });
  }

  const serverList = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    members: guild.memberCount
  }));

  res.json({
    status: "online",
    servers: client.guilds.cache.size,
    users: serverList.reduce((a, b) => a + b.members, 0),
    totalOnline: 0,
    totalOffline: 0,
    commands: 0,
    serverList
  });

});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
