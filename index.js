const path = require('path')
const express = require('express')
const app = express()

const EventEmitter = require('node:events');

const ytdl = require('ytdl-core')
const cors = require('cors')
app.use(cors())
const port = process.env.PORT || 3000;

const YoutubeMusicApi = require('youtube-music-api')
const { send } = require('process')

try {
    // getting (crazy ass error) -> MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 
    // 11 exit listeners added to [Bus]. Use emitter.setMaxListeners() to increase limit i\src\utils.js:7:11)
    // add the following 2 lines to fix that.
    var emitter = new EventEmitter();
    emitter.setMaxListeners(100);

    const api = new YoutubeMusicApi()
    api.initalize()
        .then(info => {
            app.get('/getSearchSuggestions', (req, res) => {

                api.getSearchSuggestions(req.query.q).then(result => {
                    if (typeof result === 'string') {
                        // console.log(typeof result)
                        res.json([result])
                    } else {
                        res.json(result)
                    }
                })

            })

            app.get('/getSearchResult', (req, res) => {
                // type can be [song, video, album, artist, playlist]
                api.search(req.query.q, req.query.type)
                    .then((result) => {
                        // console.log(result)
                        if (req.query.type === 'song') {
                            result.content.map((item) => {
                                if (item.artist.name !== undefined) {
                                    item.artist = [item.artist];
                                }
                            })
                        }
                        res.json(result)
                    })

            })

            // app.get('/getAlbum', (req, res) => {

            //     api.getAlbum(req.query.browseId)
            //         .then(result => {
            //             // console.log(result)
            //             res.json(result)
            //         })

            // })

            app.get('/getArtist', (req, res) => {
                console.log(req.query.browseId);
                api.getArtist(req.query.browseId)
                    .then(result => {
                        // console.log(result)
                        res.json(result)
                    })

            })

            app.get('/getPlaylist', (req, res) => {
                api.getPlaylist(req.query.browseId)
                    .then(result => {
                        res.json(result)
                    })

            })
        })

} catch (e) {
    console.log('Connection error :\n\tCheck your connection')
}

app.get('/getStream', async (req, res, next) => {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    try {
        const videourl = `https://www.youtube.com/watch?v=${req.query.videoId}`
        const videoInfo = await ytdl.getInfo(videourl)
        const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly')
        // console.log(audioFormats[0].url)
        // selecting url of audioBitrate: 128kbps
        res.write(audioFormats[1].url)
        res.end()
        // console.log('served...');
    } catch (error) {
        next(error)
    }
})

app.get('/getStreamWithTag', async (req, res, next) => {
    console.log(req.query.videoId)

    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    try {
        const videourl = `https://www.youtube.com/watch?v=${req.query.videoId}`
        const videoInfo = await ytdl.getInfo(videourl)
        const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly')
        // console.log(audioFormats[0].url)

        // selecting url of audioBitrate: 128kbps
        let html_text = `
            <source id="mainStream" src="${audioFormats[1].url}" type="audio/webm">`
        res.write(html_text)
        res.end()
        // console.log('served...');
    } catch (error) {
        next(error)
    }
})

app.get('/', (req, res) => {
    const data = {
        host: 'localhost',
        port: port,
        status: 'Running',
        url: `http://127.0.0.1:${port} or http://localhost:3000`
    }
    res.json(data)
})

app.listen(port, host = '0.0.0.0',  () => {
    console.log(`http://127.0.0.1:${port}`)
})