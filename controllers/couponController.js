import User from "../models/userModel.js"
import Coupon from "../models/couponModel.js"

export const getCoupons = async (req, res) => {  
    try {       
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 8
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const coupons = await Coupon.find({isActive:true}).sort({ createdAt: -1 })     
        .limit(limit)
        .skip((page-1)*limit)
        const couponsCount = await Coupon.find({isActive:true}).countDocuments()
        res.status(200).render('coupons',{user:userData,coupons,totalPages: Math.ceil(couponsCount/limit),currentPage: page})
    } catch (err) {
        console.log(err)
    }
}
export const getCheckCoupon = async (req, res) => {  
    try { 
        const {amount,code} = req.query
        const coupon = await Coupon.findOneAndUpdate({code,isActive:true},{$inc:{limit:-1}},{new:true})
        if (!coupon) {
            res.status(200).json({message:'Invalid Coupon'})
        }
        if (coupon.minPurchases <= amount) {
            let cpDiscount = coupon.minPurchases * (coupon.discount/100)
            let tAmount = amount - cpDiscount 
            res.status(200).json({coupon,cpDiscount,tAmount})
        }else{
            res.status(200).json({message:'This Coupon is not deserved now'})
        }    
    } catch (err) {
        console.log(err)
    }
}


//-----------------Admin side -----------//
export const loadCouponMng = async(req,res)=>{
    try {
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 7
        const coupons = await Coupon.find().sort({ createdAt: -1 })     
        .limit(limit)
        .skip((page-1)*limit)
        const couponsCount = await Coupon.find().countDocuments()

        res.status(200).render('couponManagement',{isLogged:true,coupons,totalPages: Math.ceil(couponsCount/limit),currentPage: page}) 
    } catch (err) {
        console.log(err)
    }
}
export const addCoupon = async(req,res)=>{
    try {
        
        const {code, discount, minPurchases, limit, expiryDays} = req.body
        const existing = await Coupon.findOne({code})
        if (existing) {
            res.status(200).json({success:false,message:'Coupon code is already exist'})
            return
        }
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + parseInt(expiryDays))
        const coupon = new Coupon({
            code,
            discount,
            minPurchases,
            limit,
            expiryDate:expirationDate
        })
        await coupon.save()
        res.status(200).json({success:true})
    } catch (err) {
        console.log(err)
    }
}
export const getEditCoupon = async(req,res)=>{
    try {
        const couponId = req.query.couponId
        const coupon = await Coupon.findOne({_id:couponId})
        const currentDate = new Date();
        const expiryDate = coupon.expiryDate;
        const timeDifference = expiryDate.getTime() - currentDate.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24))
        res.status(200).json({coupon:coupon,daysLeft})
    } catch (err) {
        console.log(err)
    }
}
export const editCoupon = async(req,res)=>{
    try {
        const {code, discount, minPurchases, limit, expiryDays, id} = req.body
        const existing = await Coupon.findOne({code})
        if (existing && existing._id != id) {
            res.status(200).json({success:false,message:'Coupon code is already exist'})
            return
        }
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + parseInt(expiryDays))
        const update = await Coupon.updateOne({_id:id},{$set:{code,discount,minPurchases,limit,expiryDate:expirationDate}})
        console.log(update);
        res.status(200).json({success:true})
    } catch (err) {
        console.log(err)
    }
}
export const removeCoupon = async(req,res)=>{
    try {
        const code = req.body.couponCode
        await Coupon.deleteOne({code})
        const couponsCount = await Coupon.countDocuments()
        if(couponsCount == 0){
            res.status(200).json({success:true,isEnd:true})
        }
        res.status(200).json({success:true}) 
    } catch (err) {
        console.log(err)
    }
}
export const couponListing = async(req,res)=>{
    try {
        const {code,status} = req.body
        let isActive 
        if(status == 'true'){ 
            isActive = false
        }else{
            isActive = true
        }
        await Coupon.updateOne({code},{$set:{isActive}})
        res.redirect('/admin/couponManage') 
    } catch (err) {
        console.log(err)
    }
}