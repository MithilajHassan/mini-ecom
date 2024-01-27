import {generateOTP, sentMail} from '../middlewares/sendMail.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import bcrypt from 'bcrypt'

// ----------Password bcrypting-----------//
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error)
    }
}


// -----------Signup------------//
export const loadSignup = async (req, res) => {
    try {
        res.status(200).render('signup')            
    } catch (e) {
        console.log(e)
    }
}
export const signuping = async (req, res) => {
    try {
        const existingEmail = await User.findOne({email:req.body.email})
        if (req.body.name.trim()===''||req.body.email.trim()===''||req.body.password.trim()===''||req.body.m_number.trim()===''){
            res.render('signup', { mes:"Inputs cannot be empty"}) 
        } else if (existingEmail) {
            res.status(409).render('signup', { mes: 'Email already exist' })
        } else {
            const sPassword = await securePassword(req.body.password)
            const user = new User({
                name: req.body.name,
                mobile_number: req.body.m_number,
                email: req.body.email,
                password: sPassword,
            })
            const userData = await user.save()
            if (userData) {               
                const OTP = await generateOTP()
                await User.findByIdAndUpdate({_id:userData._id},{$set:{otp:OTP}})
                sentMail(userData.email,OTP)
                req.session.otpSented = true
                res.redirect('/verifyOtp')
            } else {
                res.status(401).render('signup', { mes: "Failed, please try again" })
            }
        }
    } catch (e) {
        console.log(e)     
    }  
}

// ----------- O T P -----------//
export const getOtp = async (req, res) => {
    try {     
        res.status(200).render('otp')            
    } catch (e) {
        console.log(e)
    }
}
export const verifyOtp = async (req,res) => {
    try {
        const enteredOTP = req.body.otp.trim()
        if(enteredOTP ==''){
            res.status(401).render('otp',{mes:"Epmty field"})
        }else{
            const userData = await User.findOne({otp:enteredOTP})
            if (userData) {
                req.session.user_id = userData._id
                delete req.session.otpSented
                await User.findOneAndUpdate({otp:enteredOTP},{$set:{otp:0}})
                res.redirect('/')
            } else {
                res.status(401).render('otp',{mes:"Wrong OTP"})
            }
        }                    
    } catch (e) {
        console.log(e)
    }
}

// -----------Login------------//
export const getLogin = async(req,res)=>{
    try {
        res.status(200).render('login')     
    } catch (err) {
        console.log(err)
    }
}
export const verifyLogin = async(req,res)=>{
    try {
        const userData = await User.findOne({email:req.body.email})
        if(userData){                   
            if(userData.is_blocked == true){
                res.status(403).render('login',{bUser:userData})
            }else{
                const passwordChecking = await bcrypt.compare(req.body.password,userData.password) 
                if(passwordChecking){
                    req.session.user_id = userData._id
                    res.redirect('/')
                }else {
                    res.status(401).render('login', { mes: "Incorrect Password !!" })
                }         
            }
        }else{
            res.status(401).render('login', { mes: "Email not exist !!" }) 
        }
    } catch (err) {
        console.log(err)
    }
} 

//--------forgot password-------//
export const getForgotpass = async(req,res)=>{
    try {    
        res.status(200).render('forgot')
    } catch (err) {
        console.log(err);
    }
}
export const forgotpass = async(req,res)=>{
    try {
        const email = req.body.email
        const userData = await User.findOne({email})
        if (userData) {
            const OTP = await generateOTP()
            await User.findByIdAndUpdate({_id:userData._id},{$set:{otp:OTP}})
            req.session.otpSented = true
            sentMail(userData.email,OTP)
            res.redirect('/forgotOTP')
        } else {
            res.status(200).render('forgot',{mes:'Email is not exist'})
        }        
    } catch (err) {
        console.log(err);
    }
}
export const getOtpForForgot = async(req,res)=>{
    try {
        res.status(200).render('otp')
    } catch (err) {
        console.log(err);
    }
}
export const checkOtpForForgot = async(req,res)=>{
    try {
        const enteredOTP = req.body.otp.trim()
        if(enteredOTP ==''){
            res.status(401).render('otp',{mes:"Epmty field"})
        }else{
            const userData = await User.findOne({otp:enteredOTP})
            if (userData) {               
                await User.findOneAndUpdate({otp:enteredOTP},{$set:{otp:0}})
                res.status(200).render('passwordChange',{userId:userData._id})
            } else {
                res.status(401).render('otp',{mes:"Wrong OTP"})
            }
        }     
    } catch (err) {
        console.log(err);
    }
}
export const changePass = async(req,res)=>{
    try {
        const {newPassword, id} = req.body
        const sPassword = await securePassword(newPassword)
        await User.findByIdAndUpdate({_id:id},{$set:{password:sPassword}})
        delete req.session.otpSented
        res.redirect('/login')
    } catch (err) {
        console.log(err);
    }
}


// -----------Home page------------//
export const getHome = async(req,res)=>{
    try {
        const categoryData = await Category.find({status:true})
        const productData = await Product.find({is_there:true})
        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id})
            res.status(200).render('home',{user:userData,product:productData,category:categoryData})
        }else{
            res.status(200).render('home',{product:productData,category:categoryData})
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).send('internal Server error')
    }
} 

// ----------- Logout ------------//
export const userLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.log(err);
    }
}