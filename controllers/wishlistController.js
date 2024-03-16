import Product from "../models/productModel.js"
import User from "../models/userModel.js"
import Wishlist from "../models/wishlistModel.js"

export const getWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findById(userId)
        const wishlist = await Wishlist.findOne({userId})
        if (wishlist) {
            const productIds = wishlist.products.map(product=>product.productId.toString())
            const products = await Product.find({ _id: { $in: productIds } })
            res.status(200).render('wishlist',{user:userData,products})
        }else{
            res.status(200).render('wishlist',{user:userData})
        }  
    } catch (err) {
        console.log(err)
    }
}
export const addToWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id
        if(userId){
            const userData = await User.findById({_id:userId})
            if(userData.is_blocked == true){              
                res.status(403).render('login',{bUser:userData})
            }else{
                const productId = req.body.productId
                await Wishlist.updateOne({userId},{$push:{products:{productId}}},{upsert:true})
                res.status(200).json({message:'Added to your Wishlist',success:true})  
            }            
        }else{
            res.status(200).json({message:'Please login first.'})
        }
        
    } catch (err) {
        console.log(err)
    }
}
export const removeWishProduct = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const productId = req.body.productId
        const wish = await Wishlist.findOneAndUpdate({userId},{$pull:{products:{productId}}},{new:true})
        console.log(wish)
        if(wish.products.length== 0){
            res.status(200).json({message:'Removed from your Wishlist',last:'You have no items in your wishlist'})
        }else{
            res.status(200).json({message:'Removed from your Wishlist'})
        }                 
    } catch (err) {
        console.log(err)
    }
}