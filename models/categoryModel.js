import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name:{
        type:String,
        require:true
    },status:{
        type:Boolean,
        require:true,
        default:true
    }
})

const Category = mongoose.model('Category',categorySchema)
export default Category

