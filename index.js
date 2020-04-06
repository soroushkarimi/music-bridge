require("dotenv").config();
const qs = require("qs");
const Telegraf = require("telegraf");
const axios = require("axios");

const SERVICES = [
  {
    name: "SPOTIFY",
    format: "https://open.spotify.com/",
    api_url: "https://api.spotify.com/v1/",
  },
  {
    name: "APPLE_MUSIC",
    format: "https://music.apple.com/",
  },
];

const recognize_link = (link) => {
  let type;
  SERVICES.map((item) => {
    if (link.includes(item.format)) {
      type = item.name;
    }
  });
  return type;
};

const search = async (link) => {
  // Spotify
  console.log(link);
  const id = link.replace(SERVICES[0].format + "track/", "").slice(0, 22);
  console.log(id);
  // Auth Request
  try {
    const req_auth = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );
    const req_track = await axios.get(SERVICES[0].api_url + "tracks/" + id, {
      headers: {
        Authorization: req_auth.data["token_type"] + " " + req_auth.data["access_token"],
      }
    })
    console.log(req_auth)
    console.log(req_track)
  } catch (error) {
    console.error(error.config)
  }
};
const translate_link = (link, type) => {
  switch (type) {
    case SERVICES[0].name:
      const result = search(link, type);
      break;
    // case SERVICES[1].name:

    //     break;
    default:
      break;
  }
};

const bot = new Telegraf(process.env.BOT_KEY);
bot.start((ctx) => ctx.reply("Welcome to Music Bridge Bot."));
bot.help((ctx) =>
  ctx.reply(
    "Send me a link from Spotify or Apple music and I can find the other one for you."
  )
);
bot.use((ctx) => {
  const message_text = ctx.message.text;
  const link_type = recognize_link(message_text);
  if (link_type === undefined) {
    ctx.reply("Link is not valid. Please try a correct link.");
  } else {
    search(ctx.message.text);
    ctx.reply(link_type);
    // const result = translate_link(link_type, message_text)
  }
  console.log(link_type);
});
bot.launch();
