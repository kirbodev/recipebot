const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "recipe",
  description: "Gives a recipe based on a keyword.",
  syntax: "/recipe <keyword>",
  slash: true,
  guildOnly: true,
  category: "Recipes",
  options: [
    {
      name: "keyword",
      description:
        "A keyword to search a recipe for. Can be more than one word.",
      required: true,
      type: 3, // String
    },
  ],
  callback: async ({ interaction, args }) => {
    const db = require("../db");
    if ((await db.get(`user-${interaction.user.id}-lang`)) === undefined)
      return await interaction.followUp(
        "You must config your account before using commands using /config!",
        {
          ephemeral: true,
        }
      );
    if (!args)
      return await interaction.followUp("No keyword(s) provided.", {
        ephemeral: true,
      });
    const ytdl = require("ytdl-core");
    const ytsr = require("ytsr");
    const puppeteer = require("puppeteer");

    var query = args.join(" ");
    var prefsource = await db.get(`user-${interaction.user.id}-source`);
    console.log(query);
    console.log(prefsource);
    if (!args) return await interaction.followUp("You must specify the keyword!");
    await interaction.reply("Working on it...", {
      ephemeral: true
    })

    // Remove comments, replace with ifs (if db.get(source) === 'youtube'...)
    if (prefsource === "youtube") {
      // Make it so that it only allows videos to be found.
      var filters = await ytsr.getFilters(query);
      var filter = filters.get("Type").get("Video");
      // Get the search results
      var searchResults = await ytsr(filter.url, {
        limit: 20,
      });
      if (searchResults.items.length === 0) return interaction.followUp(`No videos found at all matching: \`${query}\`.`).catch()
      console.log(searchResults.items);
      // Make an array of approved channels
      var englishchannelarray = [
        // Binging with babish
        "UCJHA_jMfCvEnv-3kRjTCQXw",
        // Joshua Weissman
        "UChBEbMKI1eCcejTtmI32UEw",
        // Tasty Recipes
        "UCZvoUuniFzmOjfBt67lNsEQ",
        // Gordon Ramsay
        "UCIEv3lZ_tNXHzL3ox-_uUGQ",
        // Jamie Oliver (haiyaa)
        "UCpSgg_ECBj25s9moCDfSTsA",
        // Nick DiGiovanni
        "UCMyOj6fhvKFMjxUCp3b_3gA",
        // Guga foods
        "UCfE5Cz44GlZVyoaYTHJbuZw",
        // GialloZafferano English
        "UChxU-cVEOaJOwCaSuBoZ9Qg",
        // How to cook that
        "UCsP7Bpw36J666Fct5M8u-ZA",
        // Nino's Home
        "UCKetFmtqdh-kn915crdf72A",
        // Oh Nino,
        "UCJHbY-iAP5qP5pJNsV8M_UQ",
        // Sauce Stash
        "UC_oqZXtcxfJTaw1j2M1H1XQ",
        // Emma's Goodies
        "UCgmOd6sRQRK7QoSazOfaIjQ",
        // Food Wishes
        "UCRIZtPl9nb9RiXc9btSTQNw",
        // Adam Ragusea
        "UC9_p50tH3WmMslWRWKnM7dQ",
        // Oh Yum with Anna Olson
        "UCr_RedQch0OK-fSKy80C3iQ",
        // Ethan Chlebowski
        "UCDq5v10l4wkV5-ZBIJJFbzQ",
        // Souped Up Recipes
        "UC3HjB3X8jeENm46HCkI0Inw",
        // GoldenGully
        "UC9t2RlHUshAARQNGe3tfk0A",
        // Alvin Zhou
        "UCsdD3quGf01RWABJt8wLe9g",
        // BBC Good Food
        "UCl4i6QsatTho9QJW50GbLAA",
      ];
      var italianchannelarray = [
        // GialloZafferano
        "UC76vuUkGWnPUDFWcgM2_yMg",
        // Cucchiaio D'Argento
        "UCvoisSjGsQb2NXu-TS5HdWw",
        // CookAround Recipes
        "UC57y8n08hzTwGeoHPOV_rpA",
        // Fatto in casa da benedetta
        "UCIIe8pQHrmWSzs1i5o3r10w",
        // Stefano Barbato
        "UCcX5Tqd4ChFuqmTx0VVAFwg",
        // Rita Chef
        "UCX90ttcEHSOv9asv-4lFnJA",
        // Cucina con paulina
        "UCjlvZW2sSwPFRE2z3h0EsEQ",
      ];
      var numyt = searchResults.items.length < 20 ? searchResults.items.length : 20;
      for (let i = 0; i < numyt; i++) {
        var ytdlinfo = await ytdl.getBasicInfo(searchResults.items[i].url);
        var lang = await db.get(`user-${interaction.user.id}-lang`);
        if (lang === "italian") {
          var langarray = italianchannelarray;
        } else if (lang === "english") {
          var langarray = englishchannelarray;
        }
        if (langarray.indexOf(ytdlinfo.videoDetails.channelId) !== -1) {
          var video = {
            title: ytdlinfo.videoDetails.title,
            shortDescription: ytdlinfo.videoDetails.description?.slice(0, 500),
            channel: {
              name: ytdlinfo.videoDetails.ownerChannelName,
              url: `https://youtube.com/channel/${ytdlinfo.videoDetails.channelId}`,
              icon: ytdlinfo.videoDetails.ownerProfileUrl,
            },
            thumbnail: ytdlinfo.videoDetails.thumbnails[0],
            url: ytdlinfo.videoDetails.video_url,
            upload_date: ytdlinfo.videoDetails.uploadDate,
            likes: ytdlinfo.videoDetails.likes,
            views: parseInt(ytdlinfo.videoDetails.viewCount),
          };
          var recipeytembed = new MessageEmbed()
            .setTitle(video.title)
            .setURL(video.url)
            .setDescription(video.shortDescription)
            .setImage(video.thumbnail.url)
            .setFields([
              {
                name: "Ratings",
                value: `Likes: ${video.likes}, Views: ${
                  video.views
                }, View to like ratio: ${Math.round(
                  (video.likes / video.views) * 100
                )}%`,
              },
            ]);
          return interaction.followUp({
            embeds: [recipeytembed],
          }).catch()
        } else {
          console.log("bruh");
          var lang = await db.get(`user-${interaction.user.id}-lang`);
          if (lang === "italian") {
            var website =
              "https://www.giallozafferano.it/ricerca-ricette/" + query + "/";
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto(website);

            await page.click(
              "#gz-best-swiper > div:nth-child(1) > article > a > div.gz-image-recipe.gz-video"
            )
            .catch(async (err) => {
              return interaction.followUp(
                "Couldn't find a recipe with the name " + query + "!"
              ).catch()
            })
            page.on("load", async () => {
              const nameelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-title-content.gz-innerdesktop > h1"
              );
              var name = await (
                await nameelement.getProperty("innerText")
              ).jsonValue();
              var diffelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(1) > span.gz-name-featured-data > strong"
              );
              if (diffelement) {
                var diff = await (
                  await diffelement.getProperty("innerText")
                ).jsonValue();
              }
              var sizeelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
              );
              if (sizeelement) {
                var size = await (
                  await sizeelement.getProperty("innerText")
                ).jsonValue();
              }
              var imageelement = await page.$(
                "#gz-disclaimer-trigger > div > div > div:nth-child(3) > picture > img"
              );
              if (imageelement) {
                var image = await (
                  await imageelement?.getProperty("src")
                ).jsonValue();
              }
              var costelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
              );
              if (costelement) {
                var cost = await (
                  await costelement.getProperty("innerText")
                ).jsonValue();
              }
              var recipe = {
                name: name,
                difficulty: diff,
                size: size,
                image: image ? image : null,
                cost: cost,
                url: page.url(),
              };
              console.log(recipe);
              const recipeembed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle(recipe.name)
                .setURL(recipe.url)
                .setFields([
                  {
                    name: "Dosi per",
                    value: recipe.size,
                    inline: true,
                  },
                  {
                    name: "Difficoltá",
                    value: recipe.difficulty,
                    inline: true,
                  },
                  {
                    name: "Costo",
                    value: recipe.cost,
                    inline: true,
                  },
                ])
                .setImage(recipe.image);
              return interaction.followUp({
                embeds: [recipeembed],
              }).catch()
            });
          } else if (lang === "english") {
            var website =
              "https://www.giallozafferano.com/recipes-search/" + query + "/";
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto(website);
            await page.click(
              "body > div.gz-page.mh2021Page > main > div > div > article:nth-child(2) > div.gz-image-recipe.gz-video"
            );
            page.on("load", async () => {
              console.log(page.url());
              const nameelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-title-content.gz-innerdesktop > h1"
              );
              var name = await (
                await nameelement.getProperty("innerText")
              ).jsonValue();
              var diffelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div > div > ul > li:nth-child(1) > span.gz-name-featured-data > strong"
              );
              var diff = await (
                await diffelement.getProperty("innerText")
              ).jsonValue();
              var sizeelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
              );
              var size = await (
                await sizeelement.getProperty("innerText")
              ).jsonValue();
              var imageelement = await page.$(
                "#gz-disclaimer-trigger > div > div > div:nth-child(3) > picture > img"
              );
              if (imageelement) {
                var image = await (
                  await imageelement.getProperty("src")
                ).jsonValue();
              }
              var costelement = await page.$(
                "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
              );
              var cost = await (
                await costelement.getProperty("innerText")
              ).jsonValue();
              var recipe = {
                name: name,
                difficulty: diff,
                size: size,
                image: image ? image : null,
                cost: cost,
                url: page.url(),
              };
              const recipeembed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle(recipe.name)
                .setURL(recipe.url)
                .setFields([
                  {
                    name: "Size",
                    value: recipe.size,
                    inline: true,
                  },
                  {
                    name: "Difficulty",
                    value: recipe.difficulty,
                    inline: true,
                  },
                  {
                    name: "Cost",
                    value: recipe.cost,
                    inline: true,
                  },
                ])
                .setImage(recipe.image);
              return interaction.followUp({
                embeds: [recipeembed],
              }).catch()
            });
          } else {
            console.log("Could not find user's preferences.");
          }
        }
      }
    }
    if (prefsource === "website") {
      console.log("bruh");
      var lang = await db.get(`user-${interaction.user.id}-lang`);
      if (lang === "italian") {
        var website =
          "https://www.giallozafferano.it/ricerca-ricette/" + query + "/";
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(website);

        await page.click(
          "#gz-best-swiper > div:nth-child(1) > article > a > div.gz-image-recipe.gz-video"
        )
        .catch(async (err) => {
          // **BEFORE USING YOUTUBE USE BBC GOOD FOOD**
          // Make it so that it only allows videos to be found.
          var filters = await ytsr.getFilters(query);
          var filter = filters.get("Type").get("Video");
          // Get the search results
          var searchResults = await ytsr(filter.url, {
            limit: 20,
          });
          if (searchResults.items.length === 0) return interaction.followUp(`No videos found at all matching: \`${query}\`.`).catch()
          // Make an array of approved channels
          var englishchannelarray = [
            // Binging with babish
            "UCJHA_jMfCvEnv-3kRjTCQXw",
            // Joshua Weissman
            "UChBEbMKI1eCcejTtmI32UEw",
            // Tasty Recipes
            "UCZvoUuniFzmOjfBt67lNsEQ",
            // Gordon Ramsay
            "UCIEv3lZ_tNXHzL3ox-_uUGQ",
            // Jamie Oliver (haiyaa)
            "UCpSgg_ECBj25s9moCDfSTsA",
            // Nick DiGiovanni
            "UCMyOj6fhvKFMjxUCp3b_3gA",
            // Guga foods
            "UCfE5Cz44GlZVyoaYTHJbuZw",
            // GialloZafferano English
            "UChxU-cVEOaJOwCaSuBoZ9Qg",
            // How to cook that
            "UCsP7Bpw36J666Fct5M8u-ZA",
            // Nino's Home
            "UCKetFmtqdh-kn915crdf72A",
            // Oh Nino,
            "UCJHbY-iAP5qP5pJNsV8M_UQ",
            // Sauce Stash
            "UC_oqZXtcxfJTaw1j2M1H1XQ",
            // Emma's Goodies
            "UCgmOd6sRQRK7QoSazOfaIjQ",
            // Food Wishes
            "UCRIZtPl9nb9RiXc9btSTQNw",
            // Adam Ragusea
            "UC9_p50tH3WmMslWRWKnM7dQ",
            // Oh Yum with Anna Olson
            "UCr_RedQch0OK-fSKy80C3iQ",
            // Ethan Chlebowski
            "UCDq5v10l4wkV5-ZBIJJFbzQ",
            // Souped Up Recipes
            "UC3HjB3X8jeENm46HCkI0Inw",
            // GoldenGully
            "UC9t2RlHUshAARQNGe3tfk0A",
            // Alvin Zhou
            "UCsdD3quGf01RWABJt8wLe9g",
            // BBC Good Food
            "UCl4i6QsatTho9QJW50GbLAA",
          ];
          var italianchannelarray = [
            // GialloZafferano
            "UC76vuUkGWnPUDFWcgM2_yMg",
            // Cucchiaio D'Argento
            "UCvoisSjGsQb2NXu-TS5HdWw",
            // CookAround Recipes
            "UC57y8n08hzTwGeoHPOV_rpA",
            // Fatto in casa da benedetta
            // Stefano Barbato
            // Rita Chef
            // Cucina con paulina
          ];
          var numyt = searchResults.items.length < 20 ? searchResults.items.length : 20;
          for (let i = 0; i < numyt; i++) {
            var ytdlinfo = await ytdl.getBasicInfo(searchResults.items[i].url);
            var lang = await db.get(`user-${interaction.user.id}-lang`);
            if (lang === "italian") {
              var langarray = italianchannelarray;
            } else if (lang === "english") {
              var langarray = englishchannelarray;
            }
            if (langarray.indexOf(ytdlinfo.videoDetails.channelId) !== -1) {
              var video = {
                title: ytdlinfo.videoDetails.title,
                shortDescription: ytdlinfo.videoDetails.description?.slice(
                  0,
                  500
                ),
                channel: {
                  name: ytdlinfo.videoDetails.ownerChannelName,
                  url: `https://youtube.com/channel/${ytdlinfo.videoDetails.channelId}`,
                  icon: ytdlinfo.videoDetails.ownerProfileUrl,
                },
                thumbnail: ytdlinfo.videoDetails.thumbnails[0],
                url: ytdlinfo.videoDetails.video_url,
                upload_date: ytdlinfo.videoDetails.uploadDate,
                likes: ytdlinfo.videoDetails.likes,
                views: parseInt(ytdlinfo.videoDetails.viewCount),
              };
              var recipeytembed = new MessageEmbed()
                .setTitle(video.title)
                .setURL(video.url)
                .setDescription(video.shortDescription)
                .setImage(video.thumbnail.url)
                .setFields([
                  {
                    name: "Ratings",
                    value: `Likes: ${video.likes}, Views: ${
                      video.views
                    }, View to like ratio: ${Math.round(
                      (video.likes / video.views) * 100
                    )}%`,
                  },
                ]);
              return interaction.followUp({
                embeds: [recipeytembed],
              }).catch()
            } else {
              return interaction.followUp(
                "Couldn't find a recipe with the name " + query + "!"
              ).catch()
            }
          }
        })

        page.on("load", async () => {
          const nameelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-title-content.gz-innerdesktop > h1"
          );
          var name = await (
            await nameelement.getProperty("innerText")
          ).jsonValue();
          var diffelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(1) > span.gz-name-featured-data > strong"
          );
          var diff = await (
            await diffelement.getProperty("innerText")
          ).jsonValue();
          var sizeelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
          );
          var size = await (
            await sizeelement.getProperty("innerText")
          ).jsonValue();
          var imageelement = await page.$(
            "#gz-disclaimer-trigger > div > div > div:nth-child(3) > picture > img"
          );
          if (imageelement) {
            var image = await (
              await imageelement.getProperty("src")
            ).jsonValue();
          }
          var recipe = {
            name: name,
            difficulty: diff,
            size: size,
            image: image ? image : null,
            url: page.url(),
          };
          console.log(recipe);
        });
      } else if (lang === "english") {
        var website =
          "https://www.giallozafferano.com/recipes-search/" + query + "/";
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.click(
          "#gz-best-swiper > div:nth-child(1) > article > a > div.gz-image-recipe.gz-video"
        )
        .catch(async (err) => {
          return interaction.followUp(
            "Couldn't find a recipe with the name " + query + "!"
          ).catch()
        })
          
        await page.goto(website);
        await page.click(
          "body > div.gz-page.mh2021Page > main > div > div > article:nth-child(2) > div.gz-image-recipe.gz-video"
        );
        page.on("load", async () => {
          console.log(page.url());
          const nameelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-title-content.gz-innerdesktop > h1"
          );
          var name = await (
            await nameelement.getProperty("innerText")
          ).jsonValue();
          var diffelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div > div > ul > li:nth-child(1) > span.gz-name-featured-data > strong"
          );
          var diff = await (
            await diffelement.getProperty("innerText")
          ).jsonValue();
          var sizeelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div.gz-featured-data-recipe.gz-recipe-summary > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
          );
          var size = await (
            await sizeelement.getProperty("innerText")
          ).jsonValue();
          var imageelement = await page.$(
            "#gz-disclaimer-trigger > div > div > div:nth-child(3) > picture > img"
          );
          if (imageelement) {
            var image = await (
              await imageelement.getProperty("src")
            ).jsonValue();
          }
          var costelement = await page.$(
            "body > div.gz-page.mh2021Page > main > div.gz-toprecipe.gz-fullbg.gz-critical > div.gz-topstrip-recipe > div.gz-featured-data-cnt > div > div > ul > li:nth-child(4) > span.gz-name-featured-data > strong"
          );
          var cost = await (
            await costelement.getProperty("innerText")
          ).jsonValue();
          var recipe = {
            name: name,
            difficulty: diff,
            size: size,
            image: image ? image : null,
            cost: cost,
            url: page.url(),
          };
          console.log(recipe);
          const recipeembed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle(recipe.name)
            .setURL(recipe.url)
            .setFields([
              {
                name: "Size",
                value: recipe.size,
                inline: true,
              },
              {
                name: "Difficulty",
                value: recipe.difficulty,
                inline: true,
              },
              {
                name: "Cost",
                value: recipe.cost,
                inline: true,
              },
            ])
            .setImage(recipe.image);
          return interaction.followUp({
            embeds: [recipeembed],
          }).catch()
        });
      } else {
        console.log("Could not find user's preferences.");
      }
    }
  },
};
