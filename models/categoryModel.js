import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name:{
        type:String,
        require:true
    },status:{
        type:Boolean,
        require:true,
        default:true
    },offer:{
        type:Number,
        require:false,
        default:0
    }
})

const Category = mongoose.model('Category',categorySchema)
export default Category

