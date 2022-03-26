const transporter = require('../../config/emailTransportal')

const sendActivationEmail = async (email, token) => {
    await transporter.sendMail({
        from: 'My App <info@test-app.com>',
        to: email,
        subject: 'Account Activation',
        html: `Token is ${token}`
    })
}

module.exports = {sendActivationEmail}