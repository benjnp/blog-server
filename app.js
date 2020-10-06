const express = require('express')
const app = express()
const postRouter = require('./routers/post-router')
const userRouter = require('./routers/user-router')

require('./mongoose')

app.use(express.json())
app.use(postRouter)
app.use(userRouter)

module.exports = app