const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const PostSchema = new mongoose.Schema({
    content: {
        type: {},
        required: true
    },
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
    image: {
        url: String,
        publicId: String
    },
    likes: [{
        type: ObjectId,
        ref: "User"
    }],
    comments: [{
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: {
            type: ObjectId,
            ref: "User"
        },
    }]
}, { timestamps: true })

module.exports = mongoose.model("Post", PostSchema)