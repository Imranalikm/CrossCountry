const nodemailer = require('nodemailer');

const sendMail = async (option)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    })


    const info = await transporter.sendMail(option)
}

module.exports = sendMail;