import Address from "../models/addressModel.js"
import Cart from "../models/cartModel.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import User from "../models/userModel.js"

export const getOrder = async(req,res)=>{
    try {
        const userId = req.session.user_id       
        const address = await Address.findOne({userId})
        if (address && address.addresses.length > 0) {
            const products = JSON.parse(req.query.cart)
            const totalAmount = req.query.amount
            const userData = await User.findOne({_id:userId})
            res.status(200).render('checkout',{user:userData,address:address.addresses,products,totalAmount,cartP:req.query.cart})
        }else{
            res.redirect('/addAddress')
        }
    } catch (err) {
        console.log(err)
    }
}
export const makeOrder = async (req, res) => {
    try {
        const { payment, userId, totalAmount, addressId } = req.body
        const cart = await Cart.findOne({ userId })
        const trimmedAddressId = addressId.trim()
        let products = []
        for (let item of cart.product) {
            products.push({
                productId: item.productId,
                quantity: item.quantity
            })
        }
        const newOrder = new Order({
            userId: userId,
            products: products,
            totalAmount: totalAmount,
            payment: payment,
            addressId: trimmedAddressId
        })
        await newOrder.save()
        res.status(200).render('successOrder')
    } catch (err) {
        console.log(err)
    }
}

export const myOrders = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const order = await Order.findOne({ userId }).sort({ createdAt: -1 })
        let products = []
        for(let item of order.products){
            const product = await Product.findById(item.productId)
            products.push({
                product,
                quantity:item.quantity,
                price:parseInt(product.price * item.quantity),
                status:item.status
            })
        }
        res.status(200).render('myOrders', { user: userData, orders: products })              
    } catch (err) {
        console.log(err)
    }
}
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user_id
        const productId = req.params.id
        console.log(productId)
        await Order.findOneAndUpdate(
            { userId, "products.productId": productId },
            { $set: { "products.$.status": "Cancelled" } },
            { new: true }
        )
        res.status(200).json({ message: "Order cancelled successfully" })
    } catch (error) {
        console.error("Error cancelling order:", error)
    }
}

//-----------------Admin side -----------//
export const allOrders = async(req,res)=>{
    try {
        const orders = await Order.find().sort({ createdAt: -1 })
        let products = []
        for(let order of orders){
            for(let item of order.products){
                const product = await Product.findById(item.productId)
                products.push({
                    product,
                    quantity:item.quantity,
                    price:parseInt(product.price * item.quantity),
                    status:item.status,
                    id:item._id,
                    payment:order.payment
                })
            }
        }
        res.status(200).render('allOrders', {products,orders })              
    } catch (err) {
        console.log(err)
    }
}

