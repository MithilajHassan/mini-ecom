import User from "../models/userModel.js"
import Razorpay from 'razorpay'
import WalletHistory from "../models/walletModel.js"

const instance = new Razorpay({
    key_id: process.env.Key_ID,
    key_secret: process.env.key_secret
})
export const getWallet = async (req, res) => {
    try {   
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 5    
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const histories = await WalletHistory.find({userId}).sort({CreatedAt:-1}).limit(limit).skip((page-1)*limit)
        const walletCount = await WalletHistory.find({userId}).countDocuments()
        res.status(200).render('wallet',{user:userData,histories,totalPages: Math.ceil(walletCount/limit),currentPage: page,})
    } catch (err) {
        console.log(err)
    }
}

export const payToWallet = async (req, res) => {
    try {       
        const amount = req.query.amount
        const payment = await instance.orders.create({
            amount: amount * 100, 
            currency: 'INR',
            payment_capture: '1' 
        })
        res.json({payment,key_id:process.env.Key_ID})
    } catch (err) {
        console.log(err)
    }
}
export const payingToWallet = async (req, res) => {
    try {       
        const amount = req.body.amount
        const userId = req.session.user_id
        await User.updateOne({_id:userId},{$inc:{balance:amount}})
        const walletHistory = new WalletHistory({
            userId,
            amount:amount,
            type:'Deposit'
        })
        const history = await walletHistory.save()
        res.json({success:true,history})
    } catch (err) {
        console.log(err)
    }
}