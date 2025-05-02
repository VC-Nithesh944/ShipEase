const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config(); 

async function getMyTransporter() {
    
    return await nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure:true,
        auth: {
          user: process.env.EMAIL,
        //   pass: process.env.PWD,
          pass: "tybc zxub bzjb pply",
        },
      });
}

function sendMail(transporter, mailOptions) {
    return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return {error};
        }
        return {info};
    });
}

module.exports = {
    getMyTransporter,
    sendMail,
    // doSendMail
}