
const Sequelize = require('sequelize')

const sequelize = require('../database/db')

const Model = Sequelize.Model


class User extends Model{

}

User.init({

    username: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    }

}, {
    sequelize,
    modelName: 'User'
})


module.exports = User