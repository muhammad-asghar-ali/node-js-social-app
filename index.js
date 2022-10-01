require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const fs = require('fs')
    // const AuthRoutes = require(`./routes/AuthRoutes`)

const app = express()
const http = require("http").createServer(app)

const io = require("socket.io")(http, {
    cors: {
        origin: [process.env.CLIENT_URL],
        method: ["GET", "POST"],
        allowedHeaders: ["Content-type"]
    }
})

app.use(cors({
    origin: ["http://localhost:3000"],
}))
app.use(morgan('tiny'))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.DBURI, {
        useNewUrlParser: true,
        // useUnifiedToplogy: true,
        // useCreateIndex: true
    }).then(() => console.log("DB connected"))
    .catch(err => console.log("DB connection error", err.message))

const port = process.env.PORT || 3001

fs.readdirSync('./routes').map(r => app.use('/api', require(`./routes/${r}`)))
    // app.use('/api', AuthRoutes)

io.on("connect", (socket) => {
    socket.on("new-post", (newPost) => {
        socket.broadcast.emit("new-post", newPost)
    })
})


http.listen(port, () => {
    console.log("App is reunning on port " + port)
})