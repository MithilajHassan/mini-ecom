import { Schema, model } from "mongoose"

const WishlistSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        require:true
    },
    products:[{
        productId:{
            type:Schema.ObjectId,
            tequire:true
        },
    }],
    },
    { timestamps: true }
)

const Wishlist = model('Wishlist',WishlistSchema)
export default Wishlist