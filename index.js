require('dotenv').config()
const Telegraf = require('telegraf')

const SERVICES = [
    {
        name: 'SPOTIFY',
        format: 'https://open.spotify.com/'
    },
    {
        name: 'APPLE_MUSIC',
        format: 'https://music.apple.com/'
    }
]

const recognize_link = (link) => {
    let type;
    SERVICES.map(item => {
        if(link.includes(item.format)) {
            type = item.name
        }
    })
    return type
}

const bot = new Telegraf(process.env.BOT_KEY)
bot.start((ctx) => ctx.reply('Welcome to Music Bridge Bot.'))
bot.help((ctx) => ctx.reply('Send me a link from Spotify or Apple music and I can find the other one for you.'))
bot.use((ctx) => {
    const message_text = ctx.message.text
    const link_type = recognize_link(message_text)
    if (link_type === undefined) {
        ctx.reply("Link is not valid. Please try a correct link.")
    } else {
        ctx.reply(link_type)
        // const result = translate_link(link_type, message_text)
    }
    console.log(link_type)
  })
bot.launch()