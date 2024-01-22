import {getHome, getLogin, getOtp, loadSignup, signuping, userLogout, verifyLogin, verifyOtp}  from '../controllers/userController.js'

import express from 'express'
import { isOtpSent, is_logged, is_logout } from '../middlewares/auth.js'
const user_route = express.Router()

//-------Home page-------//
user_route.get('/',getHome)

//------User Loign-------//
user_route.get('/login',is_logged,getLogin)
user_route.post('/login',is_logged,verifyLogin)

//------User Signup-------//
user_route.get('/signup',is_logged,loadSignup)
user_route.post('/signup',is_logged,signuping)

//--------OTP----------//
user_route.get('/verifyOtp',isOtpSent,getOtp)
user_route.post('/verifyOtp',isOtpSent,verifyOtp)



//------Logout-------//
user_route.get('/logout',is_logout,userLogout)

export default user_route