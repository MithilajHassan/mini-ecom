import Address from "../models/addressModel.js";
import User from "../models/userModel.js";

//----------- user Address ------------//
export const userAddress = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId})
        res.status(200).render('address',{user:userData,address})
    } catch (err) {
        console.log(err);
    }
}
export const getAddAddress = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        res.status(200).render('addAddress',{user:userData})
    } catch (err) {
        console.log(err);
    }
}
export const addAddress = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const {name,mno,pincode,address,state,district,city} = req.body
        await Address.updateOne({userId},{$push:{addresses:{name,mno,pincode,address,state,district,city}}},{upsert:true})           
        res.redirect('/userAddress')
    } catch (err) {
        console.log(err);
    }
}
export const getEditAddress = async(req,res)=>{
    try {
        const {userId,index} = req.query
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId})      
        res.status(200).render('editAddress',{user:userData,address:address.addresses[index],index,userId})
    } catch (err) {
        console.log(err)
    }
}
export const editAddress = async(req,res)=>{
    try {
        const {name,mno,pincode,address,state,district,city,userId,index} = req.body
        await Address.updateOne({userId},{$set:{[`addresses.${index}`]:{name,mno,pincode,address,state,district,city}}})           
        res.status(200).redirect('/userAddress')
    } catch (err) {
        console.log(err)
    }
}
export const deleteAddress = async(req,res)=>{
    try {
        const {userId,index} = req.body
        const address = await Address.findOne({userId:userId})
        address.addresses.splice(index,1)
        await address.save()
        res.status(200).json({success:true})
    } catch (err) {
        console.log(err)
    }
}