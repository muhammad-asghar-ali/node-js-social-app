const { expressjwt: jwt } = require("express-jwt");
const PostModel = require("../models/post")
const UserModel = require("../models/user")

module.exports.requireSignIn = () => {
    jwt({
        secret: process.env.JWTSCRECT,
        algorithms: ['HS256']
    })
}

module.exports.canEditAndDeletePost = async(req, res, next) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "id is missing in the params" })
        }
        const post = await PostModel.findById({ _id: id })

        if (id != post.postedBy) {
            return res.status(400).json({ message: "Unautorized" })
        } else {
            next()
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.isAdmin = async(req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id)
        if (user.role !== "Admin") {
            return res.status(400).json({ message: "Unautorized" })
        } else {
            next()
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}