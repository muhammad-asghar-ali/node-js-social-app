const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController')
const { requireSignIn } = require('../middleware/index')


router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/current-user', requireSignIn, authController.currentUser)
router.post('/forget-passsword', requireSignIn, authController.forgetPassword)


module.exports = router