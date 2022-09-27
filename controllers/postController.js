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
            publicId: result.public_id
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.postsByUser = async(req, res) => {
    try {
        const userId = req.user._id
        const posts = await PostModel.find({ postedBy: userId })
            .populate("postedBy", "_id name image")
            .sort({ createdAt: -1 })
            .limit(10)
        if (!posts.length) {
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.getUserPost = async(req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "id is missing in the params" })
        }
        const post = await PostModel.findById({ _id: id })
        if (!post) {
            return res.status(200).json({ message: "No post found" })
        }
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.updateUserPost = async(req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "id is missing in the params" })
        }
        const post = await PostModel.findByIdAndUpdate(id, data, { new: true })
        res.status(200).json(post)

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.deleteUserPost = async(req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "id is missing in the params" })
        }
        const post = await PostModel.findByIdAndDelete(id)

        if (post.image && post.image.publicId) {
            const image = await cloudinary.uploader.destory(post.image.publicId)
        }
        res.status(200).json({ ok: true })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}