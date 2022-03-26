
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "e7fdd2438aa408",
        pass: "8a25a5a626c0cc"
    }
});

module.exports = transporter


