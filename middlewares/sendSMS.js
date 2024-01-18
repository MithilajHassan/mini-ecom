import dotenv from 'dotenv'
import twilio from 'twilio'

dotenv.config()
const accountSID = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = twilio(accountSID,authToken)
export const OTP = Math.floor(1000+Math.random()*9000)

export const sendOTP = async(toPhoneNumber,otp)=>{
    try {
        const message = `Your OTP is ${otp}`
        const response = await client.messages.create({
            body:message,
            from:process.env.TWILIO_PHONE_NUMBER,
            to:toPhoneNumber
        })
        console.log('OTP sent successfully')
        return message
    } catch (err) {
        console.log(`Otp error:${err}`)
    }
}


  