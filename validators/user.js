const {check} =  require('express-validator')

const User = require('../models/User')

const {findByEmail} = require('../services/UserService')


const registerValidator = () => {
    return [
        check('email')
            .notEmpty().withMessage('Email cannot be null').bail()
            .isEmail().withMessage('Email must be a valid email').bail()
            .normalizeEmail().bail()
            .custom(async (email) => {
                const user =  await findByEmail(email)
                if(user) {
                    throw new Error("Email already in use")
                }
            }),

        check('username')
            .notEmpty().withMessage('Username cannot be null').bail()
            .isLength({min: 3, max: 10}).withMessage('Username should be btw 3 to 10 xters long').bail(),



        check('password')
            .notEmpty().withMessage('Password cannot be null').bail()
            .isLength({ min: 8, max: 15 }).withMessage("your password should have min and max length between 8-15").bail()
            .matches(/\d/).withMessage("your password should have at least one number").bail()
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("your password should have at least one sepcial character").bail()

    ]
}






module.exports = {registerValidator}