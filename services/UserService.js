const bcrypt = require('bcrypt')
const User = require('../models/User')


const save = async (req) => {


    const {username, email, password} = req.body


    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

        return await User.create({
            username,
            email,
            password: hashedPassword
        })

}

const findByEmail = async (email) => {
    return await User.findOne({where : {email: email}})
}

module.exports = {save, findByEmail}