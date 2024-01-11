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
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    is_admin:{
        type:Boolean,
        require:true,
        default:false
    }
})

export const User = mongoose.model('users',userSchema)
