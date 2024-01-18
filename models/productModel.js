import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },brand:{
        type:String,
        required:true
    },category:{
        type:String,
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
    }
})

const Product = mongoose.model('Product',productSchema)
export default Product