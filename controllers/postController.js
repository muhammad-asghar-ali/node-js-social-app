const PostModel = require("../models/post")
const UserModel = require("../models/user")
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
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image")
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

module.exports.newsFeed = async(req, res) => {
    try {
        const id = req.user._id
        const user = await UserModel.findById(id)
        let following = user.following
        following.push(req.user._id)

        const posts = await PostModel.find({ postedBy: { $in: { following } } })
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image")
            .sort({ createdAt: -1 }).limit(100)
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.likePost = async(req, res) => {
    try {
        const id = req.body._id
        if (id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const post = await PostModel.findByIdAndUpdate(id, {
            $addToSet: { like: req.user._id }
        }, { new: true })
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.unlikePost = async(req, res) => {
    try {
        const id = req.body._id
        if (id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const post = await PostModel.findByIdAndUpdate(id, {
            $pull: { like: req.user._id }
        }, { new: true })
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
module.exports.addComment = async(req, res) => {
    try {
        const { postId, comment } = req.body
        if (!postId) {
            return res.status(400).json({ message: "post id is missing" })
        }
        const post = await PostModel.findByIdAndUpdate(postId, {
                $push: { comments: { text: comment, postedBy: req.user._id } }
            }, { new: true })
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image")

        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}


module.exports.removeComment = async(req, res) => {
    try {
        const { postId, comment } = req.body
        if (!postId) {
            return res.status(400).json({ message: "post id is missing" })
        }
        const post = await PostModel.findByIdAndUpdate(postId, {
            $pull: { comments: { text: comment } }

        }, { new: true })
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}