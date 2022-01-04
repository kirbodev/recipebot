const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require("../db");
const client = require("../main");

module.exports = {
  name: "creatordm",
  description: "Sends a message to the creator of the bot.",
  syntax: "/creatordm <suggestion/message/bug/important> <message>",
  aliases: ["dmcreator", "dmc", "cdm"],
  slash: "both",
  guildOnly: true,
  options: [
    {
      name: 'category',
      description: 'The category of the message: Either suggestion, message, bug or important',
      required: true,
      type: 3, // String
    },
    {
      name: 'message',
      description: 'The message you want to send.',
      required: true,
      type: 3
    }
  ],
  category: "Recipes",
  cooldown: '1m',
  callback: async ({ interaction, args, message }) => {
    if (interaction)
      return await interaction.reply(
        "This command should be executed via r!dmc or r!dmcreator, thanks! (It should also be used in our DMs!)",
        {
          ephemeral: true,
        }
      );
    if (await db.get(`ban-${message.author.id}`) !== undefined) {
        return message.reply("You have been banned from using this command by the bot creator!")
        .then((m) => {
            setTimeout(() => {
                m.delete()
            }, 5000)
        })
    }
    if ((await db.get(`user-${message.author.id}-lang`)) === undefined)
      return await message
        .reply(
          "You must config your account before using commands using /config!"
        )
        .then((m) => {
          setTimeout(() => {
            m.delete();
          }, 5000);
        });
    if (message.channel.type !== "DM") {
      return await message.reply(
        "To protect the privacy of your message, this command can only be used in DMs (dm me to use!)"
      )
      .then((m) => {
        message.delete();
          setTimeout(() => {
              m.delete();
          }, 3000)
      })
    }
    if (
      args[0].toLowerCase() !== "suggestion" &&
      args[0].toLowerCase() !== "message" &&
      args[0].toLowerCase() !== "bug" &&
      args[0].toLowerCase() !== "important"
    )
      return message.reply("Invalid statement for category. Correct syntax: r!cdm <Category: suggestion, message, bug, important> <message>");
    var dmsonembed = new MessageEmbed()
    .setTitle("Message sent!")
    .setDescription("Your message has been sent. If the message is spam, a troll, or anything that is made to annoy me, I can ban you from using this command again... Remember to keep your DMs open to me so that I can reply back!")
    .setColor('GREEN')
    await message.author.send({
      embeds: [dmsonembed]
    })
    var msg = args.slice(1, args.length);
    var skirby = client.users.cache.find((u) => u.id === "695228246966534255");
    var msgembed = new MessageEmbed()
      .setTitle("New Message")
      .setFields([
        {
          name: `New ${args[0]} from ${message.author.tag} | (${message.author.id})`,
          value: msg.join(" "),
        },
      ])
      .setColor("BLURPLE");
    if (args[0].toLowerCase() === "important") {
      msgembed.setDescription("<@695228246966534255>");
    }
    skirby.send({
      embeds: [msgembed],
    });
  },
};
