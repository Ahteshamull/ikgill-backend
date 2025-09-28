
import nodemailer from "nodemailer";

const SendEmail=async(EmailTo,EmailText,EmailSubject)=>{
    console.log(EmailTo)
    let transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:Number(process.env.EMAIL_PORT),
         secure: false,
        
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
        // tls:{
        //     rejectUnauthorized:false 
        // }
        
    })
    let mailOptions={
        from:process.env.EMAIL_USER,
        to:EmailTo,
        subject:EmailSubject,
        text:EmailText,
    }
    
    return await transporter.sendMail(mailOptions);
}
export default SendEmail;