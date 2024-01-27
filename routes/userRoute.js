import {changePass, checkOtpForForgot, forgotpass, getForgotpass, getHome, getLogin, getOtp, getOtpForForgot, loadSignup, signuping,
        userLogout,verifyLogin, verifyOtp}  from '../controllers/userController.js'
import express from 'express'
import { isOtpSent, is_logged, is_logout } from '../middlewares/auth.js'
import { productDetails } from '../controllers/productController.js'
const user_route = express.Router()

//-------Home page-------//
user_route.get('/',getHome)

//-------product page-------//
user_route.get('/product/:id',productDetails)

//------User Loign-------//
user_route.get('/login',is_logged,getLogin)
user_route.post('/login',is_logged,verifyLogin)

//--------forgot password-------//
user_route.get('/forgot',is_logged,getForgotpass)
user_route.post('/forgot',is_logged,forgotpass)
user_route.get('/forgotOTP',isOtpSent,getOtpForForgot)
user_route.post('/forgotOTP',isOtpSent,checkOtpForForgot)
user_route.post('/changePassword',isOtpSent,changePass)

//------User Signup-------//
user_route.get('/signup',is_logged,loadSignup)
user_route.post('/signup',is_logged,signuping)

//--------OTP----------//
user_route.get('/verifyOtp',isOtpSent,getOtp)
user_route.post('/verifyOtp',isOtpSent,verifyOtp)


//------Logout-------//
user_route.get('/logout',is_logout,userLogout)

export default user_route