import { Schema, model } from "mongoose";

const couponSchema = new Schema({
    code: {
        type: String,
        require: true
    },
    discount: {
        type: Number,
        require: true
    },
    maxPurchases: {
        type: Number,
        require: true
    },
    minPurchases: {
        type: Number,
        require: true
    },
    limit: {
        type: Number,
        require: true
    },
    isActive:{
        type:Boolean,
        default:true,
        require:true
    },
    expiryDate: {
        type: Date,
        require: true
    }
})
couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 })
const Coupon = model('Coupon', couponSchema)
export default Coupon
