const DiscordJS = require("discord.js");
const WOKcommands = require("wokcommands");
const path = require("path");
const mongoose = require("mongoose");
const db = require("./db");
require("dotenv").config({
  path: `${__dirname}/.env`,
});

const client = new DiscordJS.Client({
  intents: [
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "GUILDS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_INTEGRATIONS",
    "GUILD_MEMBERS",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
  ],
});
module.exports = client;

client.on("ready", () => {
  console.log(`Signed in as ${client.user.tag}!`);
  client.user.setActivity("r!help", {
    type: "LISTENING",
  });
  new WOKcommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
    delErrMsgCooldown: 5,
    ephemeral: true,
    testServers: "907340495498407977",
    botOwners: "695228246966534255",
    mongoUri: process.env.MONGO_URI,
  })
    .setDefaultPrefix("r!")
    .setColor(0x32cd32);
});

client.on("guildCreate", async (guild) => {
  // Find a channel that includes general or welcome, if not found use default channel.

  var channel = guild.channels.cache.find(
    (c) => c.name.toLowerCase() === "general" && c.type === "text"
  );
  if (channel === null || channel === undefined) {
    var channel = guild.channels.cache.find(
      (c) => c.name.toLowerCase() === "welcome" && c.type === "text"
    );
  }
  if (channel === null || channel === undefined) {
    var chnl = guild.channels.cache
      .filter((c) => c.type === "text")
      .find((x) => x.position === 0);
    var channel = guild.channels.cache.get(guild.systemChannelID) || chnl;
  }
  // v Info, Help, Thanks, Get started
  var joinembed = new DiscordJS.MessageEmbed()
    .addTitle("Thanks for inviting me!")
    .setDescription("Ok, first of all, I'll help you use the bot! (me)")
    .setFields([
      {
        name: "Help",
        value:
          "If you ever need help, are unsure of a command, or just want to check out what you can do, press / and click on the RecipeBot icon, that will show you all the commands and their syntax!",
      },
      {
        name: "Get Started",
        value:
          "To get started, you will have to type /config to configurate your settings, then you can use any command.",
      },
      {
        name: "Info",
        value:
          "Once you use /config, your data will sync across all servers that use RecipeBot, no need to re-config!",
      },
      {
        name: "Thank you!",
        value:
          "And finally, thank you for inviting this bot, I took a lot of time to make this experience the best it can be. If you find any bugs or would like to request a feature, use /creatordm and then your message.",
      },
    ]);
  channel.send({
      embeds: [joinembed],
    })
    .catch((e) => {
      console.log(e);
    });
});

client.login(process.env.DISCORD_TOKEN);
