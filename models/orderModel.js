import { Schema, model } from "mongoose";

const orderSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    products:[{
        productId:{
            type:String,
            require:true
        },quantity:{
            type:Number,
            require:true,
        },status:{
            type:String,
            require:true,
            default:'Pending'
        }     
    }],    
    totalAmount:{
        type:Number,
        require:true
    },
    payment:{
        type:String,
        require:true
    },
    addressId:{
        type:Schema.ObjectId,
        require:true
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

const Order = model('Order',orderSchema)
export default Order