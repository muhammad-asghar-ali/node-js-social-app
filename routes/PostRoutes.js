const express = require('express')
const router = express.Router()
const postController = require('../controllers/PostController')
const { requireSignIn } = require('../middleware/index')
const formidable = require("express-formidable")

router.post('/create-post', requireSignIn, postController.createdPost)
router.post('/upload-image', requireSignIn, formidable({ maxFieldsSize: 5 * 1024 * 1024 }), postController.uploadImage)


module.exports = router