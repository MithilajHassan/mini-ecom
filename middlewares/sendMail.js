import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const generateOTP = async()=>{
    try {
        const OTP = Math.floor(1000+Math.random()*9000)
        return OTP
    } catch (err) {
        console.log(`Otp error:${err}`)
    }
}

export const sentMail = async (userEmail,otp) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.OWN_EMAIL,
            pass: process.env.OWN_APP_PASS
        }
    })

    const mailOptions = {
        from: process.env.OWN_EMAIL,
        to: userEmail,
        subject: `OTP for user verification`,
        text: `Your otp is ${otp}`
    }

    await transporter.sendMail(mailOptions, (error, info) => {
        try {
           console.log(info.response)
        } catch (error) {
            console.log(error)
        }
    })
    
}

//   transporter.verify((error, success)=> {
//     if (error) {
//         console.error('SMTP connection error:', error);
//     } else {
//         console.log('SMTP connection is ready to send emails');
//     }
//   })
