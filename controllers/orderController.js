import Address from "../models/addressModel.js"
import Cart from "../models/cartModel.js"
import Coupon from "../models/couponModel.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import User from "../models/userModel.js"
import Razorpay from 'razorpay'
import WalletHistory from "../models/walletModel.js"

export const getOrder = async(req,res)=>{
    try {
        const userId = req.query.id       
        const address = await Address.findOne({userId})
        if (address && address.addresses.length > 0) {
            const cart = await Cart.findOne({userId}).populate('product.productId')
            const products = cart.product
            let totalAmount = 0
            for(let item of products){ 
                totalAmount += parseInt(item.quantity)* (item.productId.price - parseInt(item.productId.price * (item.productId.offPrice / 100)))
            }
            const userData = await User.findOne({_id:userId})
            const coupons = await Coupon.find({isActive:true,minPurchases:{$lte:totalAmount},maxPurchases:{$gte:totalAmount},limit:{$gt:0}})
            res.status(200).render('checkout',{user:userData,address:address.addresses,products,totalAmount,coupons})
        }else{
            res.redirect('/addAddress')
        }
    } catch (err) {
        console.log(err)
    }
}

    const instance = new Razorpay({
        key_id: process.env.Key_ID,
        key_secret: process.env.Key_SECRET
    })

export const makeOrder = async (req, res) => {
    try {
        const formData  = req.body
        const { payment, userId, totalAmount, addressId, discount } = formData
        const cart = await Cart.findOne({ userId })
        const products = []
         for (const item of cart.product) {
            const product = await Product.findOne({_id: item.productId})
            products.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price - parseInt(product.price * (product.offPrice/100))
            })
        }
        console.log(discount);
        if(payment === 'upi'){
            const newOrder = new Order({
                userId: userId,
                products: products,
                totalAmount: totalAmount,
                payment: payment,
                addressId: addressId,
            })
            if (discount) {
                newOrder.discount = discount
            }
            const orderId = await newOrder.save()
            await Cart.deleteOne({userId})
            
            const razorpayOrder = await instance.orders.create({
                amount: totalAmount *100, 
                currency: 'INR',
                receipt: orderId._id, 
                payment_capture: 1,
            })
            
            res.status(200).json({upi:true,orderId:razorpayOrder.id,totalAmount,key_id:process.env.Key_ID,id:orderId._id})

        }else if(payment === 'cash on delivery'){
            if(totalAmount <= 1000){
                const newOrder = new Order({
                    userId: userId,
                    products: products,
                    totalAmount: totalAmount,
                    payment: payment,
                    addressId: addressId
                })
                if (discount) {
                    newOrder.discount = discount
                }
                await newOrder.save()
                await Cart.deleteOne({userId})
                res.status(200).json({cashOnDelivery:true})
            }else{
                res.status(200).json({cashOnDelivery:true,message:'above Rs 1000 not allowed for Cash On Delivery'})
            }

        }else if(payment === 'wallet'){
            const userData = await User.findOne({_id:userId})
            if (parseInt(userData.balance)>parseInt(totalAmount)) {
                await User.updateOne({_id:userId},{$inc:{balance:-totalAmount}})
                const newOrder = new Order({
                    userId: userId,
                    products: products,
                    totalAmount: totalAmount,
                    payment: payment,
                    addressId: addressId,
                    isPaid:true
                })
                if (discount) {
                    newOrder.discount = discount
                }
                await newOrder.save()
                const walletHistory = new WalletHistory({
                    userId,
                    amount:totalAmount,
                    type:'Purchase'
                })
                await walletHistory.save()
                await Cart.deleteOne({userId})
                res.status(200).json({Wallet:true})
            }else{
                res.status(200).json({Wallet:false, message:"You don't have enough money in your wallet"})
            }
        }       
    } catch (err) {
        console.log(err)
    }
}
export const paymentStatus = async (req, res) => {
    try {
        const {orderId,status} = req.body
        const updatedOrder = await Order.findOneAndUpdate(
            {_id: orderId },
            { $set: {isPaid:status} },
            { new: true }
        )
        if (!updatedOrder) {
            res.status(404).json({ message: "Order Payment Status not changed" })
        }
        res.status(200).json({ message: "Order Payment Status changed" })
    } catch (error) {
        console.error("Error change payment status:", error)
    }
}
export const paymentRetry = async (req, res) => {
    try {
        const {totalAmount,id} = req.query
        const razorpay = await instance.orders.create({
            amount: totalAmount *100, 
            currency: 'INR',
            receipt: id, 
            payment_capture: 1,
        })
        if (!razorpay) {
            res.status(404).json({ message: "Didn't get the payment receipt" })
        }
        res.status(200).json({payId:razorpay.id})
    } catch (error) {
        console.error("Error payment retry:", error)
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
                    price:parseInt(item.price * item.quantity),
                    status:item.status,
                    isPaid:order.isPaid,
                    payment:order.payment,
                    id:order._id,
                    discount:order.discount
                })
            }
        }
        res.status(200).render('myOrders', { user: userData, orders: products ,key_id:process.env.Key_ID})              
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
        const orderProduct = updatedOrder.products.find(product => product._id.equals(orderId))
        if(updatedOrder.payment === 'upi' || updatedOrder.payment === 'wallet'){
            const returnFund = orderProduct.quantity *  orderProduct.price
            await User.updateOne({_id:userId},{$inc:{balance:returnFund}})
            const walletHistory = new WalletHistory({
                userId,
                amount:returnFund,
                type:'Refund'
            })
            await walletHistory.save()
        }
        await Product.updateOne({_id:productId},{$inc:{quantity:quantity}})
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
        const totalAmount = orderProduct.price * orderProduct.quantity     
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
            const returnFund = orderProduct.quantity *  orderProduct.price
            await User.updateOne({_id:userId},{$inc:{balance:returnFund}})
            const walletHistory = new WalletHistory({
                userId,
                amount:returnFund,
                type:'Refund'
            })
            await walletHistory.save()
            await Product.updateOne({_id:productId},{$inc:{quantity:quantity}})
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
export const getInvoice = async(req,res)=>{
    try {     
        const id = req.query.id     
        const order = await Order.findOne({ _id:id}).populate('products.productId').populate('userId')
        const addressess = await Address.findOne({userId:order.userId.id})
        const address = addressess.addresses.find((add)=> add._id.equals(order.addressId))
        res.status(200).render('invoice',{order,address})              
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
                    price:parseInt(item.price * item.quantity),
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

export const orderPending = async(req,res)=>{
    try {           
        const {orderId,userId} = req.body
        const updatedOrder = await Order.findOneAndUpdate({ userId, "products._id": orderId },{$set:{"products.$.status": 'Processing'}},{upsert:true})
        if(updatedOrder){
            res.status(200).json({success:true,orderStatus:'Processing'})
        }
        res.status(400).json()                 
    } catch (err) {
        console.log(err)
    }
}
export const orderDelivered = async(req,res)=>{
    try {           
        const {orderId,userId} = req.body
        const updatedOrder = await Order.findOneAndUpdate({ userId, "products._id": orderId },{$set:{"products.$.status": 'Delivered',"products.$.deliveredAt": Date.now(),isPaid:true}},{upsert:true})
        if(updatedOrder){
            res.status(200).json({success:true,orderStatus:'Delivered'})
        }
        res.status(400).json()                 
    } catch (err) {
        console.log(err)
    }
}
export const orderCancelling = async (req, res) => {
    try {
        const {orderId,userId} = req.body
        const updatedOrder = await Order.findOneAndUpdate({ userId, "products._id": orderId },{ $set: { "products.$.status": "Cancelled",isPaid:false } },{ new: true }).populate('products.productId')
        if (!updatedOrder) {
            res.status(404).json({ message: "Order not found or product not in the order" })
        }
        
        const orderProduct = updatedOrder.products.find(product => product._id.equals(orderId))
        if(updatedOrder.payment === 'upi' || updatedOrder.payment === 'wallet' && updatedOrder.isPaid == true){
            const returnFund = orderProduct.quantity *  orderProduct.price
            await User.updateOne({_id:userId},{$inc:{balance:returnFund}})
        }
        await Product.updateOne({_id:orderProduct.productId._id},{$inc:{quantity:orderProduct.quantity}})
        res.status(200).json({success:true,orderStatus:'Cancelled'})
    } catch (error) {
        console.error("Error cancelling order:", error)
    }
}


export const orderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        const order = await Order.findOne({'products._id':orderId }).populate('products.productId').populate('userId')
        const address = await Address.findOne({userId:order.userId._id})
        let orderAddress = address.addresses.find(add => add._id.equals(order.addressId))
        const orderProduct = order.products.find(product => product._id.equals(orderId))
        const totalAmount = orderProduct.price * orderProduct.quantity     
        console.log(order.products,orderAddress)
        res.status(200).render('orderDetails', { order, orderAddress, orderProduct, totalAmount })              
    } catch (err) {
        console.log(err)
    }
}