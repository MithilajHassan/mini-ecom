import User from "../models/userModel.js"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js"

export const getCart = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findById({_id:userId}) 
        const cart = await Cart.findOne({userId})
        let products = [] 
        let totalPrice = 0
        if(cart){
            for(let item of cart.product){
                const product = await Product.findById(item.productId)
                products.push({
                    product,
                    quantity:item.quantity
                })
                totalPrice += parseInt((product.price - parseInt(product.price *(product.offPrice / 100))) * item.quantity)
            }
        }    
        res.status(200).render('cart',{user:userData,cart:products,totalPrice})   
    } catch (err) {
        console.log(err)
    }
}
export const addToCart = async(req,res)=>{
    try {
        const productId = req.body.productId
        const userId = req.session.user_id
        await Cart.updateOne({userId},{$push:{product:{productId}}},{upsert:true})
        await Product.updateOne({_id:productId},{$inc:{quantity:-1}})     
        res.redirect('/cart')   
    } catch (err) {
        console.log(err)
    }
}
export const removeCartProduct = async(req,res)=>{
    try {
        const {cartQty,productId} = req.body
        const userId = req.session.user_id
        await Cart.updateOne({userId},{$pull:{product:{productId}}})
        await Product.updateOne({_id:productId},{$inc:{quantity:cartQty}})
        res.redirect('/cart')   
    } catch (err) {
        console.log(err)
    }
}
export const cartQuantiyPlus = async(req,res)=>{
    try {
        const productId = req.body.productId
        const userId = req.session.user_id
        const prod = await Product.findOne({ _id: productId },{ _id: 0, quantity: 1 })
        if(Number(prod.quantity > 0)){
            await Cart.updateOne({userId,"product.productId":productId},{$inc:{"product.$.quantity":1}})
            await Product.updateOne({_id:productId},{$inc:{quantity:-1}})
            res.status(200).json({success:true})   
        }else{
            res.status(200).json({success:false})
        }
    } catch (err) {
        console.log(err)
    }
}
export const cartQuantiyMinus = async(req,res)=>{
    try {
        const productId = req.body.productId
        const userId = req.session.user_id
        await Cart.updateOne({userId,"product.productId":productId},{$inc:{"product.$.quantity":-1}})
        await Product.updateOne({_id:productId},{$inc:{quantity:1}})
        res.status(200).json({success:true})        
    } catch (err) {
        console.log(err)
    }
}