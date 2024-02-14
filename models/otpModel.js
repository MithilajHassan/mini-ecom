import { Schema, model } from "mongoose"

const otpSchema = new Schema({
    email:{
        type:String,
        require:true
    },
    otp:{
        type:Number,
        require:true
    },
    expireAt:{
        type:Date,
        default:Date.now,
        expires: 59
    }
})

const OTP = model('OTP',otpSchema)
export default OTP