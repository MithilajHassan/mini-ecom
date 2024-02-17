import {generateOTP, sentMail} from '../middlewares/sendMail.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import Otp from '../models/otpModel.js'
import bcrypt from 'bcrypt'
import Cart from '../models/cartModel.js'

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
        
        let filterOption = req.query.filter ? req.query.filter : ''
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
              case 'data':
                return { createdAt: -1 }
              default:
                return {}
            }
        }
        const sortQuery = await getSortQuery(sortOption)
        const getFilterQuery = (filterOption) => {
            switch (filterOption) {
                case 'under500':
                    return { price: { $lt: 500 } }
                case 'above500':
                    return { price: { $gte: 500 } }
                case 'TheIndianGarageCo':
                    return { brand: 'The Indian Garage Co' }
                case 'THEBEARHOUSE':
                    return { brand: 'THE BEAR HOUSE' }
                default:
                    return {}
            }
        }
        const filterQuery = await getFilterQuery(filterOption)

        const categoryData = await Category.find({status:true})
        const productData = await Product.find({
            is_there:true,
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ],
            ...filterQuery,
            ...categoryQuery
        })
        .sort(sortQuery)
        .limit(limit)
        .skip( (page-1) * limit)
        const productCount = await Product.find({
            is_there:true,
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ],
            ...filterQuery,
            ...categoryQuery
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
                    filterOption
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
                filterOption
            })
         } 
    } catch (err) {
        console.log(err.message)
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
                const cart = await Cart.findOne({userId})
                if(cart){
                    const isInCart = cart.product.some(item=> item.productId === id )
                    if(isInCart){
                        res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData,isInCart})
                    }else{
                        res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData})
                    }
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
        console.log(err);
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