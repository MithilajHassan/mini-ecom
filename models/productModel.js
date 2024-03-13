import mongoose, { Schema } from "mongoose"

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },brand:{
        type:String,
        required:true
    },category:{
        type:Schema.ObjectId,
        required:true
    },description:{
        type:String,
        required:true
    },price:{
        type:Number,
        required:true
    },quantity:{
        type:Number,
        required:true
    },images:{
        type:Array,
        required:true
    },is_there:{
        type:Boolean,
        default:true
    },offPrice:{
        type:Number,
        required:false,
        default:0
    },createdAt: {
        type: Date,
        default: Date.now,
    }
})

const Product = mongoose.model('Product',productSchema)
export default Product