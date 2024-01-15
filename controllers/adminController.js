import Admin from "../models/userModel.js"
import {compare} from 'bcrypt'

//--------Login for Admin-------//
export const adminGetLogin = async(req,res)=>{
    try {
        res.render('adminLogin')
    } catch (err) {
        console.log(err)
    }
}
export const verifyAdmin = async(req,res)=>{
    try {
        const adminData = await Admin.findOne({email:req.body.email})
        if(adminData){
            const passCheck = await compare(req.body.password,adminData.password)
            if (passCheck) {
                if(adminData.is_admin === true){
                    req.session.admin_id=adminData._id
                    res.redirect('/admin/dashboard')       
                }else{
                    res.status(401).render('adminLogin',{mes:'You are not Admin'})
                }
            }else{
                res.status(401).render('adminLogin', { mes: "Incorrect Password !!" })
            }
        }else{
            res.status(401).render('adminLogin', { mes: "Email not exist !!" }) 
        }
    } catch (err) {
        console.log(err)
    }
}

//--------Dashboard---------//
export const getDashboard = async(req,res)=>{
    try {
        res.status(200).render('dashboard')
    } catch (err) {
        console.log(err)
    }
}

//--------Product Management---------//
export const getProductMng = async(req,res)=>{
    try {
        res.status(200).render('productManage')
    } catch (err) {
        console.log(err)
    }
}

//----------- Logout ------------//
export const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (err) {
        console.log(err);
    }
}