import {generateOTP, sentMail} from '../middlewares/sendMail.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import Otp from '../models/otpModel.js'
import bcrypt from 'bcrypt'
import Cart from '../models/cartModel.js'
import Wishlist from '../models/wishlistModel.js'

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
        const {name,m_number,email,password,confirmPass} = req.body 
       const existingEmail = await User.findOne({email})
       if (existingEmail) {
            res.status(409).render('signup', { mes: 'Email already exist'})
        } else {
            if(password === confirmPass){
                const sPassword = await securePassword(password)
                const otpNum = await generateOTP()
                const otp = new Otp({
                    email,
                    otp:otpNum
                })
                await otp.save()
                req.session.data = {name,mobile_number:m_number,email,password: sPassword}             
                sentMail(email,otpNum)
                req.session.otpSented = true
                res.redirect('/verifyOtp')
            }else{
                res.status(401).render('signup', { mes: "Passwords are mismatch"})
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
            const userData = req.session.data
            const otpDetails = await Otp.findOne({email:userData.email})
            if (otpDetails && otpDetails.otp == enteredOTP) {
                const user  = new User({
                    name: userData.name,
                    mobile_number: userData.mobile_number,
                    email: userData.email,
                    password: userData.password,
                }) 
                const userSave = await user.save()
                req.session.user_id = userSave._id
                delete req.session.data
                delete req.session.otpSented
                res.redirect('/')
            } else {
                res.status(401).render('otp',{mes:"Wrong OTP"})
            }                   
    } catch (e) {
        console.log(e)
    }
}
export const resend = async(req,res)=>{
    try {
        const otpNum = await generateOTP()
        const email = req.session.data.email
        const otp = new Otp({
            email,
            otp:otpNum
        })
        await otp.save()
        sentMail(email,otpNum)
        res.redirect('/verifyOtp')
    } catch (err) {
        console.log(err)
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
            const otpNum = await generateOTP()
            const otp = new Otp({
                email,
                otp:otpNum
            })
            await otp.save()
            req.session.user = userData.email
            req.session.otpSented = true
            sentMail(email,otpNum)
            res.redirect('/forgotOTP')
        } else {
            res.status(200).render('forgot',{mes:'Email is not exist'})
        }        
    } catch (err) {
        console.log(err)
    }
}
export const getOtpForForgot = async(req,res)=>{
    try {
        res.status(200).render('otpForForgot')
    } catch (err) {
        console.log(err)
    }
}
export const checkOtpForForgot = async(req,res)=>{
    try {
        const enteredOTP = req.body.otp.trim()
        const email = req.session.user
        if(enteredOTP ==''){
            res.status(401).render('otpForForgot',{mes:"Epmty field"})
        }else{
            const otpDetails = await Otp.findOne({email:email})
            if (otpDetails && otpDetails.otp == enteredOTP) { 
                const userData = await User.findOne({email})              
                res.status(200).render('passwordChange',{userId:userData._id})
            } else {
                res.status(401).render('otpForForgot',{mes:"Wrong OTP"})
            }
        }     
    } catch (err) {
        console.log(err)
    }
}
export const changePass = async(req,res)=>{
    try {
        const {newPassword,confirmPass, id} = req.body
        if (newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_=+\[\]{}|;:'",.<>?/]).{8,16}$/)) {
            if(newPassword === confirmPass){
                const sPassword = await securePassword(newPassword)
                await User.findByIdAndUpdate({_id:id},{$set:{password:sPassword}})
                delete req.session.otpSented
                delete req.session.user
                res.redirect('/login')
            }else{
                res.status(401).render('passwordChange',{userId:id,mes:'Confirm password is mismatch'})
            }
        }else{
            res.status(401).render('passwordChange',{userId:id,mes:'Enter strong password at least 8 characters'})
        }   
    } catch (err) {
        console.log(err);
    }
}
export const resendForgot = async(req,res)=>{
    try {
        const otpNum = await generateOTP()
        const email = req.session.user
        const otp = new Otp({
            email,
            otp:otpNum
        })
        await otp.save() 
        sentMail(email,otpNum)
        res.redirect('/forgotOTP')
    } catch (err) {
        console.log(err)
    }
}

// -----------Home page------------//
export const getHome = async(req,res)=>{
    try {  
        let search = req.query.search ? req.query.search : '' 
        
        let page = req.query.page ?  parseInt(req.query.page) : 1
        
        let sortOption = req.query.sort ? req.query.sort : 'date'
        
        let brandFilter = req.query.brand || ''
        let priceFilter = req.query.price || ''
        let filterQuery = {}
        if (brandFilter) {
            switch (brandFilter) {
                case 'TheIndianGarageCo':
                    filterQuery.brand = 'The Indian Garage Co'
                    break;
                case 'THEBEARHOUSE':
                    filterQuery.brand = 'THE BEAR HOUSE'
                    break;
                default:
                    break;
            }
        }
        if (priceFilter) {
            switch (priceFilter) {
                case 'under500':
                    filterQuery.price = { $lt: 500 }
                    break;
                case 'above500':
                    filterQuery.price = { $gte: 500 }
                    break;
                default:
                    break;
            }
        }
        let categoryId = req.query.category ? req.query.category : ''
        let categoryQuery = {}
        if (categoryId != '') {
            categoryQuery = { category: categoryId }
        }
        const limit = 3
        const getSortQuery = (sortOption) => {
            switch (sortOption) {
              case 'lowToHigh':
                return { price: 1 }
              case 'highToLow':
                return { price: -1 }
              case 'date':
                return { createdAt: -1 }
              default:
                return {}
            }
        }
        const sortQuery = await getSortQuery(sortOption)
        const categoryData = await Category.find({status:true})
        const productData = await Product.find({
            is_there:true,
            category: { $in: categoryData.map(cat => cat._id) },
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ],
            ...categoryQuery,
            ...filterQuery
        })
        .sort(sortQuery)
        .limit(limit)
        .skip( (page-1) * limit)
        const productCount = await Product.find({
            is_there:true,
            category: { $in: categoryData.map(cat => cat._id) },
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ],
            ...categoryQuery,
            ...filterQuery
        }).countDocuments()

        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id})
            if(userData.is_blocked == true){
                res.status(403).render('login',{bUser:userData})
            }else{
                res.status(200).render('home',{
                    user:userData,
                    product: productData,
                    category: categoryData,
                    noProductsFound: productData.length === 0,
                    totalPages: Math.ceil(productCount/limit),
                    currentPage: page,
                    search: search || '',
                    sortOption,
                    brandFilter,
                    priceFilter,
                    categoryId    
                })
            }
        }else{
            res.status(200).render('home',{
                product: productData,
                category: categoryData,
                noProductsFound: productData.length === 0,
                totalPages: Math.ceil(productCount/limit),
                currentPage: page,
                search: search || '',
                sortOption,
                brandFilter,
                priceFilter,
                categoryId
            })
         } 
    } catch (err) {
        console.log(err)
    }
} 
//-------product page-------//
export const productDetails = async(req,res)=>{
    try {
        const id = req.params.id        
        const categoryData = await Category.find({status:true})
        const productData = await Product.findById({_id:id})
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await User.findById({_id:userId})
            if(userData.is_blocked == true){
                res.status(403).render('login',{bUser:userData})
            }else{
                const isInCart = await Cart.findOne({userId,'product.productId':id})
                const isInWish = await Wishlist.findOne({userId,'products.productId':id})
                if(isInCart && isInWish){
                    res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData,isInCart,isInWish})
                }else if(isInCart){
                    res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData,isInCart})
                }else if(isInWish){
                    res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData,isInWish})
                }else{
                    res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData})
                }
            }           
        }else{
            res.status(200).render('productDetails',{product:productData,category:categoryData})
        }      
    } catch (err) {
        console.log(err)
    }
}

// ----------- user profile ------------//
export const userProfie = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.status(200).render('profile',{user:userData})
    } catch (err) {
        console.log(err);
    }
}
export const EditUserProfie = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.status(200).render('profileEdit',{user:userData})
    } catch (err) {
        console.log(err);
    }
}
export const EditingUserProfie = async(req,res)=>{
    try {
        const {name,mno,id} =req.body      
        await User.findByIdAndUpdate({_id:id},{$set:{name:name,mobile_number:mno}})
        res.redirect('/profile')
    } catch (err) {
        console.log(err)
    }
}
export const getPasswordChange = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.status(200).render('resetPassword',{user:userData})
    } catch (err) {
        console.log(err)
    }
}
export const passwordChanging = async(req,res)=>{
    try {
        const {currentPass,newPass,id} = req.body
        const userData = await User.findOne({_id:id})
        if(await bcrypt.compare(currentPass,userData.password)){
            const sPassword = await securePassword(newPass)
            await User.findByIdAndUpdate({_id:id},{$set:{password:sPassword}})
            res.redirect('/profile')
        }else{
            res.status(200).render('resetPassword',{user:userData,mes:'Current password is wrong'})
        }
    } catch (err) {
        console.log(err)
    }
}

// ----------- Logout ------------//
export const userLogout = async(req,res)=>{
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (err) {
        console.log(err);
    }
}