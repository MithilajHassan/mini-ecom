import { Schema, model } from "mongoose"

const cartSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    product:[{
        productId:{
            type:String,
            tequire:true
        },
        quantity:{
            type:Number,
            default:1,
            require:true
        }
    }],
    },
    { timestamps: true }
)

const Cart = model('Cart',cartSchema)
export default Cart