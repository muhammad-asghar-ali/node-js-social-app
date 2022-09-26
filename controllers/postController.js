const PostModel = require("../models/post")

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