const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const DiscordJS = require("discord.js");
const client = require("../main");
const db = require("../db");

module.exports = {
  name: "config",
  description:
    "Use this command before using any other command. Configurates your user data.",
  slash: true,
  guildOnly: true,
  category: "Recipes",
  minArgs: 2,
  expectedArgs: "<language, italian | english> <source, youtube | website>",
  options: [
    {
      name: "language",
      description:
        "The language you want your recipes to be in.  Either italian or english.",
      required: true,
      type: 3,
    },
    {
      name: "source",
      description:
        "Where you want your recipes to be from. Either youtube or website.",
      required: true,
      type: 3,
    },
  ],
  callback: async ({ interaction, args }) => {
    if (!args) return interaction.reply("You didn't input any arguments!");
    if (
      args[0].toLowerCase() !== "italian" &&
      args[0].toLowerCase() !== "english"
    )
      return interaction.reply(
        "Language field is invalid, must be either english or italian.",
        {
          ephemeral: true,
        }
      );
    if (
      args[1].toLowerCase() !== "youtube" &&
      args[1].toLowerCase() !== "website"
    )
      return interaction.reply(
        "Source field is invalid, must be either youtube or website.",
        {
          ephemeral: true,
        }
      );
    if (args[0].toLowerCase() === "italian") {
      await db.set(`user-${interaction.user.id}-lang`, "italian");
    }
    if (args[0].toLowerCase() === "english") {
      await db.set(`user-${interaction.user.id}-lang`, "english");
    }
    if (args[1].toLowerCase() === "youtube") {
      await db.set(`user-${interaction.user.id}-source`, "youtube");
    }
    if (args[1].toLowerCase() === "website") {
      await db.set(`user-${interaction.user.id}-source`, "website");
    }
    await interaction.reply(
      `Successfully set language to ${args[0]} and source to ${args[1]}!`,
      {
        ephemeral: true,
      }
    );
  },
};
