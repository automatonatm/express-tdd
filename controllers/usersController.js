const catchAsync = require('express-async-handler')
const {save} = require('../services/UserService')


const createUser = catchAsync(async (req, res, next) => {

    const  user = await save(req)

    res.status(200).json({
        success: true,
        message: 'Account created',
        data: user,
    })

})



module.exports = {createUser}