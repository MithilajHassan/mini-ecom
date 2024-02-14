import { Schema, model } from "mongoose"

const addressSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    addresses:[{
        name:{
            type:String,
            require:true
        },
        mno:{
            type:Number,
            require:true,
        },
        pincode:{
            type:Number,
            require:true
        },
        address:{
            type:String,
            require:true,
        },
        state:{
            type:String,
            require:true
        },
        district:{
            type:String,
            require:true,
        },
        city:{
            type:String,
            require:true,
        }
    }] 
})

const Address = model('address',addressSchema)
export default Address