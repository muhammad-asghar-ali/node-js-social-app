const UserModel = require("../models/user")
const { hashPassword, comparePassword } = require('../helpers/Auth')
const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')

module.exports.register = async(req, res) => {
    try {
        const { name, email, password, secret } = req.body
        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "password is required and should be 6 character long" })
        }
        if (!secret) {
            return res.status(400).json({ message: "Answer is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const isExist = await UserModel.findOne({ email: email })
        if (isExist) {
            return res.status(400).json({ message: "Email is already exist" })
        }

        const cryptedPassword = await hashPassword(password)

        const userModel = {
            name,
            password: cryptedPassword,
            email,
            secret,
            username: nanoid(10)
        }
        const user = await UserModel.create(userModel)
        if (!user) {
            return res.status(200).json({ message: "User not found" })
        }
        res.status(201).json({ ok: true })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.login = async(req, res) => {
    try {
        const { email, password } = req.body

        if (!password) {
            return res.status(400).json({ message: "Email or Password is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email or Password is required" })
        }
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(400).json({ message: "Wrong Password" })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWTSECRET, { expiresIn: '7d' })
        user.password = undefined
        user.secret = undefined
        res.status(200).json({
            token,
            user
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.currentUser = async(req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id)
        res.status(200).json({ ok: true })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.forgetPassword = async(req, res, next) => {
    try {
        const { email, newPassword, secret } = req.body

        if (!newPassword || !newPassword.length < 6) {
            return res.status(400).json({ message: "New password is required and should be min 5 characters" })
        }
        if (!secret) {
            return res.status(400).json({ message: "secret is required" })
        }
        const user = await UserModel.findOne({ email: email, secret: secret })
        if (!user) {
            return res.status(200).json({ message: "we cannot find any details" })
        }

        const hashed = await hashPassword(newPassword)
        await UserModel.findByIdAndUpdate({ password: hashed })
        res.status(200).json({ message: "Congrates, Now you can login with your new password" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports.updateProfile = async(req, res, next) => {
    try {
        const data = req.body

        const user = await UserModel.findByIdAndUpdate(req.user._id, data, { new: true })
        if (!user) {
            return res.status(200).json({})
        }
        user.password = undefined
        user.secret = undefined
        res.status(200).json(user)
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Duplicate username" })
        }
        res.status(500).json(err.message)
    }
}

module.exports.findPeople = async(req, res, next) => {
    try {
        const id = req.user._id
        const user = await UserModel.find(id)
        const following = user.following
        following.push(user._id)
        const people = await UserModel.find({ _id: { nin: following } }).select("-password -secret").limit(10)
        res.status(200).json(people)
    } catch (err) {
        res.status(500).json(err.message)
    }
}

// middleware
module.exports.addFollower = async(req, res, next) => {
    try {
        const { _id } = req.body
        if (!_id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const user = await UserModel.findByIdAndUpdate(_id, {
            $addToSet: { followers: req.user._id }
        })
        next()
    } catch (err) {
        res.status(500).json(err.message)
    }
}

module.exports.userFollow = async(req, res, next) => {
    try {
        const { _id } = req.body
        if (!_id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const user = await UserModel.findByIdAndUpdate(req.user._id, {
            $addToSet: { following: _id }
        }, { new: true }).select("-password -secret")
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err.message)
    }
}

module.exports.userFollowings = async(req, res, next) => {
    try {
        const id = req.user._id
        const user = await UserModel.findById(id)
        const following = await UserModel.find({ _id: user.following }).limit(100)
        res.status(200).json(following)
    } catch (err) {
        res.status(500).json(err.message)
    }
}

// remove followers
module.exports.removeFollower = async(req, res, next) => {
    try {
        const { _id } = req.body
        if (!_id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const user = await UserModel.findByIdAndUpdate(_id, {
            $pull: { followers: req.user._id }
        })
        next()
    } catch (err) {
        res.status(500).json(err.message)
    }
}

module.exports.userUnFollow = async(req, res, next) => {
    try {
        const { _id } = req.body
        if (!_id) {
            return res.status(400).json({ message: "id is missing" })
        }
        const user = await UserModel.findByIdAndUpdate(req.user._id, {
            $pull: { following: _id }
        }, { new: true }).select("-password -secret")
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err.message)
    }
}

module.exports.searchUser = async(req, res, next) => {
    try {
        const { query } = req.body
        if (!query) return

        const user = await UserModel.find({
            $or: [
                { name: { $regax: query, $options: "i" } },
                { usename: { $regax: query, $options: "i" } }
            ]
        }).select("_id name image username")
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err.message)
    }
}

module.exports.getUser = async(req, res, next) => {
    try {
        const { username } = req.body
        if (!username) return

        const user = await UserModel.findOne({ username: username }).select("-password  -secret")
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err.message)
    }
}