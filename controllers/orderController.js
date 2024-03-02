import Address from "../models/addressModel.js"
import Cart from "../models/cartModel.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import User from "../models/userModel.js"
import Razorpay from 'razorpay'

export const getOrder = async(req,res)=>{
    try {
        const userId = req.session.user_id       
        const address = await Address.findOne({userId})
        if (address && address.addresses.length > 0) {
            const products = JSON.parse(req.query.cart)
            const totalAmount = req.query.amount
            const userData = await User.findOne({_id:userId})
            res.status(200).render('checkout',{user:userData,address:address.addresses,products,totalAmount})
        }else{
            res.redirect('/addAddress')
        }
    } catch (err) {
        console.log(err)
    }
}
export const makeOrder = async (req, res) => {
    try {
        const formData  = req.body
        const { payment, userId, totalAmount, addressId } = formData
        const cart = await Cart.findOne({ userId })
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
            addressId: addressId
        })
        const order = await newOrder.save()
        await Cart.deleteOne({userId})
        const orderId = order._id.toString()
        if(order.payment === 'upi'){
            await Order.updateOne({userId,_id:order._id},{$set:{isPaid:true}})
            let instance = new Razorpay({
                key_id: process.env.Key_ID,
                key_secret: process.env.Key_SECRET
            })
            const razorpayOrder = await instance.orders.create({
                amount: totalAmount *100, 
                currency: 'INR',
                receipt: orderId, 
                payment_capture: 1,
            })
            console.log(razorpayOrder);
            res.status(200).json({upi:true,orderId:razorpayOrder.id,totalAmount,key_id:process.env.Key_ID})
        }else if(order.payment === 'cash on delivery'){
            res.status(200).json({cashOnDelivery:true})
        }else{
            res.status(200).json({Wallet:true})
        }
        
    } catch (err) {
        console.log(err)
    }
}
export const myOrders = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const orders = await Order.find({ userId }).sort({ createdAt: -1 })
        let products = []
        for (let order of orders) {
            for(let item of order.products){
                const product = await Product.findById(item.productId)
                products.push({
                    product,
                    orderId:item._id,
                    quantity:item.quantity,
                    price:parseInt(product.price * item.quantity),
                    status:item.status
                })
            }
        }
        res.status(200).render('myOrders', { user: userData, orders: products })              
    } catch (err) {
        console.log(err)
    }
}
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user_id
        const orderId = req.params.id
        const { quantity, productId } = req.body
        const updatedOrder = await Order.findOneAndUpdate(
            { userId, "products._id": orderId },
            { $set: { "products.$.status": "Cancelled" } },
            { new: true }
        ).populate('products.productId')
        if (!updatedOrder) {
            res.status(404).json({ message: "Order not found or product not in the order" })
        }
        if(updatedOrder.payment === 'upi'){
            const orderProduct = updatedOrder.products.find(product => product._id.equals(orderId))
            console.log(orderProduct.productId.price,orderProduct.quantity)
            const returnFund = parseInt(orderProduct.productId.price * orderProduct.quantity)
            await User.updateOne({_id:userId},{$inc:{balance:returnFund}})
        }
        await Product.updateOne({_id:productId},{$inc:{quantity}})
        res.status(200).json({ message: "Order cancelled successfully" })
    } catch (error) {
        console.error("Error cancelling order:", error)
    }
}
export const myOrderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const order = await Order.findOne({ userId,'products._id':orderId }).populate('products.productId')
        const address = await Address.findOne({userId})
        let orderAddress = address.addresses.find(add => add._id.equals(order.addressId))
        const orderProduct = order.products.find(product => product._id.equals(orderId))
        const totalAmount = orderProduct.productId.price * orderProduct.quantity     
        res.status(200).render('myOrderDetails', { user: userData, order, orderAddress, orderProduct, totalAmount })              
    } catch (err) {
        console.log(err)
    }
}
export const returnOrder = async (req, res) => {
    try {
        const userId = req.session.user_id
        const orderId = req.params.id
        const { quantity, productId } = req.body
        const order = await Order.findOne({userId,"products._id": orderId }).populate('products.productId')
        const orderProduct = order.products.find(product => product._id.equals(orderId))
        const currentDate = new Date()
        const twelveDaysLater = new Date(orderProduct.deliveredAt)
        twelveDaysLater.setDate(twelveDaysLater.getDate() + 12)     
        if(currentDate < twelveDaysLater){
            const updatedOrder = await Order.findOneAndUpdate(
                { userId, "products._id": orderId },
                { $set: { "products.$.status": "Returned" } },
                { new: true })
            if (!updatedOrder) {
                res.status(404).json({ message: "Order not found or product not in the order" })
            }
            if(updatedOrder.payment == 'upi'){            
                console.log(orderProduct.productId.price,orderProduct.quantity)
                const returnFund = parseInt(orderProduct.productId.price * orderProduct.quantity)
                await User.updateOne({_id:userId},{$inc:{balance:returnFund}})
            }
            await Product.updateOne({_id:productId},{$inc:{quantity}})
            console.log('nearesy');
            res.status(200).json({ success:true, message: "Order returned successfully",isExpired:false})
        }else {
            res.status(200).json({ message: "Product cannot be returned after 12 days of delivery!",isExpired:true})
        }
    } catch (error) {
        console.error("Error returning order:", error)
    }
}

export const orderSuccessful = async(req,res)=>{
    try {           
        res.status(200).render('successOrder')              
    } catch (err) {
        console.log(err)
    }
}
         
//-----------------Admin side-----------//
export const allOrders = async(req,res)=>{
    try {
        let search = req.query.search ? req.query.search : ''
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 6
        const orders = await Order.find({
        })
        .sort({ createdAt: -1 })     
        .limit(limit)
        .skip((page-1)*limit)

        const orderCount = await Order.find({
        }).countDocuments()
        let products = []
        for(let order of orders){
            for(let item of order.products){
                const product = await Product.findById(item.productId)
                const userData = await User.findOne({ _id: order.userId })
                const dateData = new Date(order.createdAt)
                const date = `${dateData.getDate()}-${dateData.getMonth()+ 1}-${dateData.getFullYear()}`
                products.push({
                    product,
                    orderId:item._id,
                    quantity:item.quantity,
                    price:parseInt(product.price * item.quantity),
                    status:item.status,
                    image:product.images[0],
                    payment:order.payment,
                    userId:order.userId,
                    user:userData.name,
                    date
                })
            }
        }
        res.status(200).render('allOrders', {
            products,
            orders,
            isLogged:true,
            totalPages: Math.ceil(orderCount/limit),
            currentPage: page,
            search,
        })              
    } catch (err) {
        console.log(err)
    }
}

export const orderDelivered = async(req,res)=>{
    try {           
        const {orderId,userId} = req.body
        const updatedOrder = await Order.findOneAndUpdate({ userId, "products._id": orderId },{$set:{"products.$.status": 'Delivered',"products.$.deliveredAt": Date.now()}},{upsert:true})
        console.log(orderId,updatedOrder);
        if(updatedOrder){
            res.status(200).json({success:true,orderStatus:'Delivered'})
        }
        res.status(400).json()                 
    } catch (err) {
        console.log(err)
    }
}
export const orderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        const order = await Order.findOne({'products._id':orderId }).populate('products.productId').populate('userId')
        const address = await Address.findOne({userId:order.userId._id})
        let orderAddress = address.addresses.find(add => add._id.equals(order.addressId))
        const orderProduct = order.products.find(product => product._id.equals(orderId))
        const totalAmount = orderProduct.productId.price * orderProduct.quantity     
        console.log(order.products,orderAddress)
        res.status(200).render('orderDetails', { order, orderAddress, orderProduct, totalAmount })              
    } catch (err) {
        console.log(err)
    }
}