import {generateOTP, transporter } from '../middlewares/sendMail.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
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
                req.session.user_id = userData._id
                const OTP = await generateOTP()
                req.session.otp = OTP
                const mailOptions = {
                    from: process.env.OWN_EMAIL,
                    to: userData.email,
                    subject: `OTP for user verification`,
                    text: `Your otp is ${OTP}`
                }
                await transporter.sendMail(mailOptions,(error, info)=>{
                    try {
                        console.log('Email sent: ' + info.response)
                    } catch (error) {
                        console.log(error)
                    }
                  }) 
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
export const verifyOtp = async (req, res) => {
    try {
        if(req.body.otp.trim() ==''){
            res.status(401).render('otp',{mes:"Epmty field"})
        }else if(req.body.otp == req.session.otp){
            delete req.session.otp
            res.redirect('/')
            
        }else{
            res.status(401).render('otp',{mes:"Wrong OTP"})
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
            const passwordChecking = await bcrypt.compare(req.body.password,userData.password)
            if(passwordChecking){
                req.session.user_id = userData._id
                res.redirect('/')
            }else {
                res.status(401).render('login', { mes: "Incorrect Password !!" })
            }
        }else{
            res.status(401).render('login', { mes: "Email not exist !!" }) 
        }
    } catch (err) {
        console.log(err)
    }
} 

// -----------Home page------------//
export const getHome = async(req,res)=>{
    try {
        const productData = await Product.find()
        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id})
            res.status(200).render('home',{user:userData,product:productData})
        }else{
            res.status(200).render('home',{product:productData})
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