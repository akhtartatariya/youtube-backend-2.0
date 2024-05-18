import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
app.use(cookieParser())
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))


import commentRouter from './routes/comment.route.js'
import likeRouter from './routes/like.route.js'
import playlistRouter from './routes/playlist.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import tweetRouter from './routes/tweet.route.js'
import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'


app.use('/api/v2/comments',commentRouter)
app.use('/api/v2/likes',likeRouter)
app.use('/api/v2/playlists',playlistRouter)
app.use('/api/v2/subscriptions',subscriptionRouter)
app.use('/api/v2/tweets',tweetRouter)
app.use('/api/v2/users',userRouter)
app.use('/api/v2/videos',videoRouter)

export { app }


// localhost:3000/api/v2