# music-bridge
A Telegram Bot that translates streaming services links to each other. Currently changing spotify tracks to apple music tracks.
You can find it [here](https://t.me/MusicBridgeBot).


## Installation

First install the dependencies.
```
npm install
```

you should have a `.env` file having the keys for BOT_KEY, SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in order to run your code locally.

To run the code just enter 
```node index.js```



## Deployment

I have used heroku for deployment. Just initialize a heroku app and push the master branch to heroku. app uses worker so it won't sleep on a free heroku dyno.
You can set environment variablese via heroku cli or in the settings in your heroku web dashboard.



## Usage

you send a message with a share link of a spotify song as shown below:
```
https://open.spotify.com/track/3skn2lauGk7Dx6bVIt5DVj
```
and will get a result looking like this:
```
https://music.apple.com/us/album/starlight/992221994?i=992221996&uo=4
```



## License

MIT



Additional info will be added to this file in the future.