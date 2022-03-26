const express = require('express')
const {registerValidator} = require('../validators/user')
const  globalValidator = require('../validators/global')
const  {createUser, activateAccount} = require('../controllers/usersController')

const router = express.Router()




router.route('/').post(registerValidator(), globalValidator, createUser)

router.route('/token/:activationToken').post(activateAccount)

module.exports = router