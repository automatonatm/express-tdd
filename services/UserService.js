const bcrypt = require('bcrypt')
const User = require('../models/User')
const sendEmail = require('./sendMailService')
const crypto = require('crypto')
const sequelize = require('../config/db')


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
       await sendEmail({
           email,
          subject: 'Activation Email',
           message: `<h4>Token:  ${user.activationToken} </h4>`
       })
        await transaction.commit()
    }
    catch (err) {
        console.log(err)
        await transaction.rollback()
    }

    return user

}

const findByEmail = async (email) => {
    return await User.findOne({where : {email: email}})
}

module.exports = {save, findByEmail}