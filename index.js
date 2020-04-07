require("dotenv").config();
const qs = require("qs");
const Telegraf = require("telegraf");
const axios = require("axios");

const SERVICES = [
  {
    name: "SPOTIFY",
    format: "https://open.spotify.com/track/",
    api_url: "https://api.spotify.com/v1/",
  },
];

const recognize_link = (link) => {
  let type;
  SERVICES.map((item) => {
    if (link !== undefinedlink && link.includes(item.format)) {
      type = item.name;
    }
  });
  return type;
};

const search = async (link) => {
  let track;
  const id = link.replace(SERVICES[0].format, "").slice(0, 22);
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
        Authorization:
          req_auth.data["token_type"] + " " + req_auth.data["access_token"],
      },
    });
    const data = req_track.data;
    const track_data = {
      name: data.name,
      album: data.album.name,
      artists: data.artists.map((item) => item.name),
    };
    name_and_album = [track_data.name, track_data.album];
    const terms = name_and_album.concat(track_data.artists);
    const req_search = await axios.get(
      "https://itunes.apple.com/search?term=" + terms.join(" ") + "&entity=song"
    );

    track = req_search.data.results.find((item) => {
      return (
        item.trackName.toLowerCase() === track_data.name.toLowerCase() ||
        item.trackCensoredName.toLowerCase() === track_data.name.toLowerCase()
      );
    });
  } catch (error) {
    console.error(error);
  }
  if (track !== undefined) {
    return track.trackViewUrl;
  } else {
    return "Sorry! Could not find the track! :(";
  }
};

const bot = new Telegraf(process.env.BOT_KEY);
bot.start((ctx) => ctx.reply("Welcome to Music Bridge Bot."));
bot.help((ctx) =>
  ctx.reply(
    "Send me a link from Spotify or Apple music and I can find the other one for you."
  )
);
bot.use(async (ctx) => {
  const message_text = ctx.message.text;
  const link_type = recognize_link(message_text);
  if (link_type === undefined) {
    ctx.reply("Link is not valid. Please try a correct link.");
  } else {
    const res = await search(ctx.message.text);
    ctx.reply(res);
  }
});
bot.launch();
