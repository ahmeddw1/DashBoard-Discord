const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

/* =========================
   DISCORD BOT
   ========================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences
  ]
});

client.login(process.env.BOT_TOKEN);

/* =========================
   EXPRESS API (INSIDE BOT)
   ========================= */

const app = express();
app.use(cors());

app.get('/api/dashboard', async (req, res) => {
  // Bot presence
  const presence = client.user?.presence;
  const status = presence?.status || 'offline'; 
  // online | idle | dnd | offline

  // Guild data
  const guilds = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    members: guild.memberCount,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null
  }));

  res.json({
    status,
    servers: guilds.length,
    users: guilds.reduce((a, g) => a + g.members, 0),
    commands: 0, // optional
    serverList: guilds
  });
});

/* =========================
   START API
   ========================= */

app.listen(3000, () => {
  console.log('Dashboard API → http://localhost:3000/api/dashboard');
});

/* =========================
   BOT READY
   ========================= */

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});
