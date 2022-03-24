const catchAsync = require('express-async-handler')
const {save} = require('../services/UserService')
const AppError = require('../utils/AppError')


const createUser = catchAsync(async (req, res, next) => {

    try {
        const  user = await save(req)

        res.status(200).json({
            success: true,
            message: req.t('account_success'),
            data: user,
        })
    }catch (err) {
       return next(new AppError(err.message, 500))
    }


})



module.exports = {createUser}