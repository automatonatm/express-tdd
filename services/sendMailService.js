const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')


const sendEmail = async options => {

    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "e7fdd2438aa408",
            pass: "8a25a5a626c0cc"
        }
    });


    const message = {
        from: `noreply@gryndtech.com`,
        to: options.email,
        subject: options.subject,
        html: options.message,
        text: options.message
    };

    await transporter.sendMail(message);

};

module.exports = sendEmail