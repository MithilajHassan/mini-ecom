import {EditUserProfie, EditingUserProfie, changePass, checkOtpForForgot, forgotpass, getForgotpass, getHome, getLogin,
        getOtp, getOtpForForgot, getPasswordChange, loadSignup, passwordChanging, productDetails, resend, resendForgot, 
        signuping, userLogout,userProfie,verifyLogin, verifyOtp}  from '../controllers/userController.js'
import express from 'express'
import { isOtpSent, is_logged, is_logout } from '../middlewares/auth.js'
import { addToCart, cartQuantiyMinus, cartQuantiyPlus, getCart, removeCartProduct } from '../controllers/cartController.js'
import { addAddress, deleteAddress, editAddress, getAddAddress, getEditAddress, userAddress } from '../controllers/addressController.js'

const user_route = express.Router()

//-------Home page-------//
user_route.get('/',getHome)

//-------product page-------//
user_route.get('/product/:id',productDetails)

// ----------- user Cart ------------//
user_route.get('/cart',is_logout,getCart)
user_route.post('/cart',is_logout,addToCart)
user_route.post('/removeCartProduct',is_logout,removeCartProduct)
user_route.post('/cartQPlus',is_logout,cartQuantiyPlus)
user_route.post('/cartQMinus',is_logout,cartQuantiyMinus)

//------User profile-------//
user_route.get('/profile',is_logout,userProfie)
user_route.get('/editProfile',is_logout,EditUserProfie)
user_route.post('/editProfile',is_logout,EditingUserProfie)
user_route.get('/changePassword',is_logout,getPasswordChange)
user_route.post('/changePassword',is_logout,passwordChanging)

// ----------- user Address ------------//
user_route.get('/userAddress',is_logout,userAddress)
user_route.get('/addAddress',is_logout,getAddAddress)
user_route.post('/addAddress',is_logout,addAddress)
user_route.get('/editAddress',is_logout,getEditAddress)
user_route.post('/editAddress',is_logout,editAddress)
user_route.post('/deleteAddress',is_logout,deleteAddress)

//------User Loign-------//
user_route.get('/login',is_logged,getLogin)
user_route.post('/login',is_logged,verifyLogin)

//--------forgot password-------//
user_route.get('/forgot',getForgotpass)
user_route.post('/forgot',forgotpass)
user_route.get('/forgotOTP',isOtpSent,getOtpForForgot)
user_route.post('/forgotOTP',isOtpSent,checkOtpForForgot)
user_route.post('/changePassword',isOtpSent,changePass)
user_route.get('/resendForForgot',isOtpSent,resendForgot)

//------User Signup-------//
user_route.get('/signup',is_logged,loadSignup)
user_route.post('/signup',is_logged,signuping)

//--------OTP----------//
user_route.get('/verifyOtp',isOtpSent,getOtp)
user_route.post('/verifyOtp',isOtpSent,verifyOtp)
user_route.get('/resend',isOtpSent,resend)

//------Logout-------//
user_route.get('/logout',is_logout,userLogout)

export default user_route