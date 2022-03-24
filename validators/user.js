const {check} =  require('express-validator')

const {findByEmail} = require('../services/UserService')


const registerValidator = () => {
    return [
        check('email')
            .notEmpty().withMessage('email_null').bail()
            .isEmail().withMessage('email_invalid').bail()
            .normalizeEmail().bail()
            .custom(async (email) => {
                const user =  await findByEmail(email)
                if(user) {
                    throw new Error('email_in_use')
                }
            }),

        check('username')
            .notEmpty().withMessage('username_null').bail()
            .isLength({min: 3, max: 10}).withMessage('username_size').bail(),


        check('password')
            .notEmpty().withMessage('password_null').bail()
            .isLength({ min: 8, max: 15 }).withMessage("password_size").bail()
            .matches(/\d/).withMessage("password_pattern1").bail()
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('password_pattern2').bail()

    ]
}






module.exports = {registerValidator}