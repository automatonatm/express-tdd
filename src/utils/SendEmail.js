const nodemailer = require('nodemailer');
const ejs = require("ejs");
const htmlToText = require('html-to-text')
import path from 'path'



export default class Email {
    constructor(user, data) {
        this.data = data
        this.to = user.email
        this.user =  user
        this.from = `TEST Inc <${process.env.SMTP_EMAIL}>`;

    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })


    }

    //Send the actual email
    async send(template, subject) {

        const templateData = {
            data: this.data,
            user: this.user
        }




        const  templateFile = path.join(process.cwd(), 'email-templates', `${template}.ejs`)


        const html =  await ejs.renderFile(templateFile, templateData)



        // 2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: htmlToText.fromString(html),
            html
        };

        // 3) create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }


    async test() {
        await this.send("test", 'Test!');
    }


    async reportDisaster() {
        await this.send("report-disaster", 'New Incident Report');
    }



};