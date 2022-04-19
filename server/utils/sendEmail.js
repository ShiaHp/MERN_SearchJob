const nodemailer = require('nodemailer')


const sendEmail =  async (dataSend) =>{

 
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
    let info = await transporter.sendMail({
        from: '"Shia boo 👻" <thienxa282003@gmail.com>', 
        to: dataSend.receiverEmail, 
        subject: "Yêu cầu khôi phục lại mật khẩu ", 

        html: `
        <h3> Xin chào khách hàng ${dataSend.UserName}</h3>
        <p>  Bạn nhận được email này vì đã yêu cầu khôi phục lại mật khẩu trên trang web ${dataSend.website}   </p>
        <p>  Vui lòng click vào đường link bên dưới , để xác nhận hoàn tất thủ tục khôi phục lại mật khẩu
        
        </p>
        <div>  <a href='http://localhost:3000/reset/${dataSend.resetToken}' target= "_blank"> Click here</a></div> 
        `, // html body
      });




};





module.exports = sendEmail 