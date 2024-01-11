import {getHome, getLogin, loadSignup, signuping, userLogout, verifyLogin}  from '../controllers/userController.js'

import express from 'express'
const user_route = express.Router()

//-------Home page-------//
user_route.get('/',getHome)
user_route.get('/home',getHome)

//------User Loign-------//
user_route.get('/login',getLogin)
user_route.post('/login',verifyLogin)

//------User Signup-------//
user_route.get('/signup',loadSignup)
user_route.post('/signup',signuping)

//------User Signup-------//
user_route.get('/logout',userLogout)

export default user_route