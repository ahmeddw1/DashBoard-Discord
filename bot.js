require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

/* =========================
   ENV
   ========================= */
const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('❌ BOT_TOKEN is missing in .env');
  process.exit(1);
}

/* =========================
   DISCORD CLIENT
   ========================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* =========================
   EXPRESS API
   ========================= */
const app = express();
app.use(cors());

app.get('/api/dashboard', (req, res) => {
  const status =
    client.user?.presence?.status ||
    (client.isReady() ? 'online' : 'offline');

  const guilds = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    members: guild.memberCount,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null
  }));

  res.json({
    status, // online | idle | dnd | offline
    servers: guilds.length,
    users: guilds.reduce((a, g) => a + g.members, 0),
    commands: 0,
    serverList: guilds
  });
});

/* =========================
   START API
   ========================= */
app.listen(PORT, () => {
  console.log(`🌐 API running → http://localhost:${PORT}/api/dashboard`);
});

/* =========================
   BOT READY
   ========================= */
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* =========================
   LOGIN
   ========================= */
client.login(TOKEN);
