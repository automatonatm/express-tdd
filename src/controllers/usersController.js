const catchAsync = require('express-async-handler')
const {save, activate} = require('../services/users/UserService')
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


const activateAccount = catchAsync(async (req, res, next) => {


    const {activationToken} =  req.params



   // const user  = await activate(activationToken)

    const user = await User.findOne({where: {activationToken: token}})

    user.inactive = false

    //console.log(user)
    const savedUser = await user.save()

    res.status(200).json({
        status: true,
        user: savedUser
    })

})
module.exports = {createUser, activateAccount}