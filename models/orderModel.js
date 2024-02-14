import { Schema, model } from "mongoose";

const orderSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    totalAmout:{
        type:Number,
        require:true
    },
    payment:{
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const Order = model('Order',orderSchema)
export default Order