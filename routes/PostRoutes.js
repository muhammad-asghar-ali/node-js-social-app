const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const { requireSignIn } = require('../middleware/index')

router.post('/create-post', requireSignIn, postController.createdPost)

module.exports = router