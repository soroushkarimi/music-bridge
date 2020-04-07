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
  console.log(link)
  const id = link.replace(SERVICES[0].format + "track/", "").slice(0, 22)
  console.log(id)
  let track
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
    const data = req_track.data
    const track_data = {
        name: data.name,
        album: data.album.name,
        artists: data.artists.map( item => item.name)
    }
    name_and_album = [track_data.name, track_data.album]
    const terms = name_and_album.concat(track_data.artists)
    const req_search = await axios.get('https://itunes.apple.com/search?term=' + terms.join(' ') + '&entity=song')

    track = req_search.data.results.find((item) => {
        return item.trackName.toLowerCase() === track_data.name.toLowerCase() || item.trackCensoredName.toLowerCase() === track_data.name.toLowerCase()
    })
    console.log(req_auth)
    console.log(req_track)
    // console.log(track_data)
    console.log(terms)
    // console.log(req_search)
    console.log(track)
    
    
  } catch (error) {
    console.error(error)
  }

  if(track !== undefined) {
    return track.trackViewUrl
} else {
    return 'Sorry! Could not find the track! :('
}
};
// const translate_link = (link, type) => {
//   switch (type) {
//     case SERVICES[0].name:
//       const result = search(link, type);
//       return result
//       break;
//     // case SERVICES[1].name:

//     //     break;
//     default:
//       break;
//   }
// };

const bot = new Telegraf(process.env.BOT_KEY);
bot.start((ctx) => ctx.reply("Welcome to Music Bridge Bot."));
bot.help((ctx) =>
  ctx.reply(
    "Send me a link from Spotify or Apple music and I can find the other one for you."
  )
);
bot.use(async(ctx) => {
  const message_text = ctx.message.text;
  const link_type = recognize_link(message_text);
  if (link_type === undefined) {
    ctx.reply("Link is not valid. Please try a correct link.");
  } else {
    const res = await search(ctx.message.text);
    // ctx.reply(link_type);
    // const result = translate_link(link_type, message_text)
    ctx.reply(res)
  }
  console.log(link_type);
});
bot.launch();
