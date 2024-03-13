import { Schema, model } from "mongoose";

const orderSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true,
        ref:'User'
    },
    products:[{
        productId:{
            type:Schema.ObjectId,
            require:true,
            ref: 'Product'
        },quantity:{
            type:Number,
            require:true,
        },status:{
            type:String,
            require:true,
            default:'Processing'
        },price:{
            type:Number,
            require:true,
        },deliveredAt:{
            type:Date,
            require:false
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
        require:true,
        ref:'Address'
    },
    isPaid:{
        type:Boolean,
        require:true,
        default:false
    },
    discount:{
        type:Number,
        require:false
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

const Order = model('Order',orderSchema)
export default Order