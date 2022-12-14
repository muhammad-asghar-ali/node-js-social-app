const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 64
    },
    secret: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    about: {},
    photo: String,
    role: {
        type: String,
        deafult: "Subscriber"
    },
    followings: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)