const express = require('express')
const router = express.Router()
const postController = require('../controllers/PostController')
const { requireSignIn, canEditAndDeletePost } = require('../middleware/index')
const formidable = require("express-formidable")

router.post('/create-post', requireSignIn, postController.createdPost)
router.post('/upload-image', requireSignIn, formidable({ maxFieldsSize: 5 * 1024 * 1024 }), postController.uploadImage)

router.get('/user-post', requireSignIn, postController.postsByUser)
router.get('/user-post/:id', requireSignIn, postController.getUserPost)
router.put('/update-post/:id', requireSignIn, canEditAndDeletePost, postController.updateUserPost)
router.delete('/delete-post/:id', requireSignIn, canEditAndDeletePost, postController.deleteUserPost)


module.exports = router