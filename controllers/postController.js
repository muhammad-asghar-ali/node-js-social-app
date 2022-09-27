const PostModel = require("../models/post")
const cloudinary = require("cloudinary")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

module.exports.createdPost = async(req, res) => {
    try {
        const { content } = req.body
        if (!content) {
            res.status(400).jaon({ message: "write something to create a post" })
        }

        const post = await PostModel.create({ content: content, postedBy: req.user._id })
        res.status(200).json({
            message: "Post is created",
            post: post
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.uploadImage = async(req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.files.image.path)
        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}