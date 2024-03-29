import mongoose, { Schema } from "mongoose"

const userSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    mobile_number:{
        type:Number,
        require:true
    },
    email:{
        type:String,
        unique:true,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    balance:{
        type:Number,
        default:0,
        require:true
    },
    is_admin:{
        type:Boolean,
        require:true,
        default:false
    },is_blocked:{
        type:Boolean,
        default:false,
        require:true
    }
})

const User = mongoose.model('User',userSchema)
export default User
