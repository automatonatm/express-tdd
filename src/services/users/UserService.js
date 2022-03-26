const bcrypt = require('bcrypt')
const User = require('../../models/User')
const {sendActivationEmail} = require('../email/sendMailService')
const crypto = require('crypto')
const sequelize = require('../../config/db')


const generateToken = (length) => {
   return crypto.randomBytes(length).toString("hex");
}

const save = async (req) => {

    const {username, email, password} = req.body

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const  transaction = await sequelize.transaction()

    const newUser = {
        username,
        email,
        activationToken: generateToken(11),
        password: hashedPassword
    }

    const user =  await User.create(newUser, {transaction})


    try {
        await sendActivationEmail(email, user.activationToken)
        await transaction.commit()
    }
    catch (err) {
        console.log(err)
        await transaction.rollback()
    }

    return user

}

const activate = async (token) => {

    const user = await User.findOne({where: {activationToken: token}})

    user.inactive = false

    console.log(user)
     return   await user.save()

    //console.log(savedUser)



}

const findByEmail = async (email) => {
    return await User.findOne({where : {email: email}})
}

module.exports = {save, findByEmail, activate}