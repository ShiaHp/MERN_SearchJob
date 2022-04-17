const nodemailer = require('nodemailer')

const sendEmail =  async options =>{
    // 1, Create a transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth :{
            user : process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASSWORD
        }
        // Activate in gmail "less secure app" option
    })
    // 2, Define the email options
    const mailOptions = {
        from : 'Shiawase@gmail.com',
        to : options.email,
        subject : options.subject,
        text : options.message,
        // html :
    }
    // 3, Actually send the email

   await transporter.sendMail(mailOptions)
    // return promise
};


module.exports = sendEmail 