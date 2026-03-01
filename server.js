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
    GatewayIntentBits.GuildPresences
  ]
});

client.login(process.env.BOT_TOKEN);

// 🔥 FORCE FULL MEMBER CACHE
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    try {
      await guild.members.fetch({ withPresences: true });
      console.log(`Fetched members for ${guild.name}`);
    } catch (err) {
      console.log(`Failed fetching ${guild.name}`);
    }
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {

    const status = client.isReady() ? "online" : "offline";

    let totalUsers = 0;
    let totalOnline = 0;
    let totalOffline = 0;

    client.guilds.cache.forEach(guild => {

      totalUsers += guild.memberCount;

      guild.members.cache.forEach(member => {

        if (!member.presence || member.presence.status === 'offline') {
          totalOffline++;
        } else {
          totalOnline++;
        }

      });

    });

    res.json({
      status,
      servers: client.guilds.cache.size,
      users: totalUsers,
      totalOnline,
      totalOffline,
      commands: 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
