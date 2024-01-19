import Admin from "../models/userModel.js"
import Product from "../models/productModel.js"
import {compare} from 'bcrypt'
import multer from "multer"
import User from "../models/userModel.js"

//------------Multer--------//
const storage = multer.diskStorage({
    destination:'./public/productImgs',
    filename:(req,file,cb)=>{
            const name = Date.now()+'-'+file.originalname
            cb(null,name)
    }
})
export const upload = multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Only images are allowed!'));
        }
        cb(null, true);
    },limits:{
        fileSize: 1024 * 1024 * 10
    }
})


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
        res.status(200).render('dashboard',{isLogged:true})
    } catch (err) {
        console.log(err)
    }
}

//----------Customers------------//
export const getUsers = async(req,res)=>{
    try {
        const user = await User.find({is_admin:false})
        res.status(200).render('users',{user,isLogged:true})
    } catch (err) {
        console.log(err)
    }
}


//--------Product Management---------//
export const getProductMng = async(req,res)=>{
    try {
        res.status(200).render('products/productManage',{isLogged:true})
    } catch (err) {
        console.log(err)
    }
}
export const getAddProduct = async(req,res)=>{
    try {
        res.status(200).render('products/addProduct',{isLogged:true})
    } catch (err) {
        console.log(err)
    }
}
export const prodictAdding = async(req,res)=>{
    try {
        const product = new Product({
            name:req.body.name,
            brand:req.body.brand,
            category:req.body.category,
            description:req.body.description,
            price:req.body.price,
            quantity:req.body.quantity,
            images:req.files
        })
        const productData = await product.save()
        if (productData) {
            res.redirect("/admin/productManage")
        }else{
            res.send('failed please try again')
        }
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