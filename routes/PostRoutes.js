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

router.get('/news-feed', requireSignIn, postController.newsFeed)
router.put('/like-post', requireSignIn, postController.likePost)
router.put('/unlike-post', requireSignIn, postController.unlikePost)

router.put("/add-comment", requireSignIn, postController.addComment)
router.delete("/remove-comment", requireSignIn, postController.removeComment)

router.get("/total-posts", postController.totalPosts)
router.get("/posts", postController.posts)
router.get("/post/:id", postController.getPost)

module.exports = router