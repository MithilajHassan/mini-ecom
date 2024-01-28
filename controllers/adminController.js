import Admin from "../models/userModel.js"
import {compare} from 'bcrypt'
import multer from "multer"
import User from "../models/userModel.js"
import Category from "../models/categoryModel.js"

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
                    req.session.admin_id = adminData._id
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
export const blockUser = async(req,res)=>{
    try {
        const id = req.body.id
        await User.findOneAndUpdate({_id:id},{$set:{is_blocked:true}})  
        res.status(200).redirect('/admin/users')
    } catch (err) {
        console.log(err)
    }
}
export const unBlockUser = async(req,res)=>{
    try {
        const id = req.body.id
        await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})       
        res.status(200).redirect('/admin/users')
    } catch (err) {
        console.log(err)
    }
}

//--------Category Management--------//
export const getCategoryMng = async(req,res)=>{
    try {
        const categoryData = await Category.find()
        res.status(200).render('category',{category:categoryData,isLogged:true})
    } catch (err) {
        console.log(err)
    }
}
export const addCategory = async(req,res)=>{
    try {
        const name = req.body.name
        const category = new Category({ name:name })
        const categoryData = await category.save()
        if (categoryData) {
            res.redirect('/admin/categoryManage')
        } else {
            res.send('category is not added')
        }
    } catch (err) {
        console.log(err)
    }
}
export const removeCategory = async(req,res)=>{
    try {
        const id = req.body.id
        await Category.findOneAndUpdate({_id:id},{$set:{status:false}})       
        res.redirect('/admin/categoryManage')
    } catch (err) {
        console.log(err)
    }
}
export const recoverCategory = async(req,res)=>{
    try {
        const id = req.body.id
        await Category.findOneAndUpdate({_id:id},{$set:{status:true}})       
        res.redirect('/admin/categoryManage')
    } catch (err) {
        console.log(err)
    }
}
export const getEditCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const ctgryId = await Category.findOne({_id:id})
        const categoryData = await Category.find()
        res.status(200).render('editCategory',{ctgryId,category:categoryData,isLogged:true})
    } catch (err) {
        console.log(err)
    }
}
export const editCategory = async(req,res)=>{
    try {
        const {name,id} = req.body
        await Category.findOneAndUpdate({_id:id},{$set:{name}})   
        res.redirect('/admin/categoryManage') 
    } catch (err) {
        console.log(err)
    }
}


//----------- Logout ------------//
export const adminLogout = async(req,res)=>{
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (err) {
        console.log(err)
    }
}

// export const getEditCategory = async(req,res)=>{
//     try {
        
//     } catch (err) {
//         console.log(err)
//     }
// }