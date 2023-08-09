const express = require('express')
const auth = require("./auth");
const story = require("./story");
const user = require("./user");
const post = require("./post");
const comment = require("./comment");

const router = express.Router()
router.use('/auth', auth)
router.use('/story', story)
router.use('/user', user)
router.use('/post', post)
router.use('/comment', comment)

module.exports = router