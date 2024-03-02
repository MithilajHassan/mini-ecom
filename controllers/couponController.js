import User from "../models/userModel.js"
import Coupon from "../models/couponModel.js"

export const getCoupons = async (req, res) => {  
    try {       
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const coupons = await Coupon.find({isActive:true})
        res.status(200).render('coupons',{user:userData,coupons})
    } catch (err) {
        console.log(err)
    }
}


//-----------------Admin side -----------//
export const loadCouponMng = async(req,res)=>{
    try {
        const coupons = await Coupon.find()
        res.status(200).render('couponManagement',{isLogged:true,coupons}) 
    } catch (err) {
        console.log(err)
    }
}
export const addCoupon = async(req,res)=>{
    try {
        const {discount, maxPurchases, limit, expiryDays}=req.body
        function generateCouponCode(length) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = ''
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length)
                result += charset.charAt(randomIndex)
            }
            return result;
        }
        const code = generateCouponCode(8)
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + parseInt(expiryDays))
        const coupon = new Coupon({
            code,
            discount,
            maxPurchases,
            limit,
            expiryDate:expirationDate
        })
        await coupon.save()
        res.redirect('/admin/couponManage')
    } catch (err) {
        console.log(err)
    }
}
export const removeCoupon = async(req,res)=>{
    try {
        const code = req.body.couponCode
        const coupon = await Coupon.deleteOne({code})
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