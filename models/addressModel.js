import { Schema, model } from "mongoose"

const addressSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    addresses:[{
        _id: {
            type: Schema.ObjectId,
            immutable: true 
        },
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
        },
        active:{
            type:Boolean,
            default:true
        }
    }] 
})

const Address = model('Address',addressSchema)
export default Address