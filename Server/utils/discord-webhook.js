const https = require("https");
const { URL } = require("url");

async function sendDiscordNotification(webhookUrl, notification) {
  try {
    if (!webhookUrl) {
      console.log("Discord webhook URL not configured, skipping notification");
      return;
    }

    const payload = JSON.stringify(notification);

    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 204) {
            console.log("Discord notification sent successfully");
            resolve();
          } else {
            console.log(
              "Discord notification sent with status:",
              res.statusCode
            );
            resolve();
          }
        });
      });

      req.on("error", (error) => {
        console.error("Error sending Discord notification:", error.message);
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error("Error sending Discord notification:", error.message);
  }
}

function createChapterNotificationEmbed(chapter, manga, baseUrl) {
  const embed = {
    title: `📖 Yeni Bölüm: ${manga.name}`,
    description: `**${chapter.title}** (Bölüm ${chapter.chapterNumber})`,
    color: 0x9353d3,
    fields: [
      {
        name: "📚 Manga",
        value: manga.name,
        inline: true,
      },
      {
        name: "📝 Bölüm",
        value: `Bölüm ${chapter.chapterNumber}`,
        inline: true,
      },
      {
        name: "👤 Yükleyen",
        value: chapter.uploader || "Bilinmiyor",
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Mono Manga",
    },
  };

  if (manga.coverImage) {
    embed.thumbnail = {
      url: manga.coverImage,
    };
  }

  if (baseUrl) {
    const chapterUrl = `${baseUrl}/manga/${manga.slug}/${chapter.slug}`;
    embed.url = chapterUrl;
  }

  return embed;
}

function createDiscordNotification(chapter, manga, baseUrl) {
  const embed = createChapterNotificationEmbed(chapter, manga, baseUrl);

  let content = "";

  if (manga.discordRoleId) {
    content = `<@&${manga.discordRoleId}> Yeni bölüm yayınlandı! 🎉`;
  }

  return {
    content: content,
    embeds: [embed],
  };
}

module.exports = {
  sendDiscordNotification,
  createChapterNotificationEmbed,
  createDiscordNotification,
};
