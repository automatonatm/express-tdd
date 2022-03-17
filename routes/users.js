const express = require('express')
const {registerValidator} = require('../validators/user')
const  globalValidator = require('../validators/global')
const  {createUser} = require('../controllers/usersController')

const router = express.Router()




router
    .route('/').post(registerValidator(), globalValidator, createUser)

module.exports = router