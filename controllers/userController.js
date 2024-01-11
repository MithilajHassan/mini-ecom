import { User } from '../models/userModels.js'
import bcrypt, { hash } from 'bcrypt'

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
        if(req.session.user_id){
            console.log(req.session.user_id)
            res.status(200).redirect('/')
        }else{
            res.status(200).render('signup')
        }              
    } catch (e) {
        console.log(e)
        res.status(501).send('Internal serveral issue')
    }
}
export const signuping = async (req, res) => {
    try {
        const existingEmail = await User.findOne({email:req.body.email})
        if (existingEmail) {
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
                res.status(201).redirect('/')
            } else {
                res.render('signup', { mes: "Failed, please try again" })
            }
        }
    } catch (e) {
        console.log(e)
        if (e === 'notFound') {
            res.status(404).send('Not Found')
        } else {
            res.status(500).send('internal Server error')
        }
    }
}
// -----------Login------------//
export const getLogin = async(req,res)=>{
    try {
        if(req.session.user_id){
            console.log(req.session.user_id)
            res.status(200).redirect('/')
        }else{
            res.status(200).render('login')
        }       
    } catch (err) {
        console.log(err)
        res.status(500).send('internal Server error')
    }
}

export const verifyLogin = async(req,res)=>{
    try {
        const userData = await User.findOne({email:req.body.email})
        if(userData){
            const passwordChecking = await bcrypt.compare(req.body.password,userData.password)
            if(passwordChecking){
                req.session.user_id = userData._id
                res.status(200).redirect('/')
            }else {
                res.status(401).render('login', { mes: "Incorrect Password !!" })
            }
        }else{
            res.status(401).render('login', { mes: "Email not exist !!" }) 
        }
    } catch (err) {
        console.log(err)
        res.status(500).send('internal Server error')
    }
} 

// -----------Home page------------//
export const getHome = async(req,res)=>{
    try {
        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id})
            res.status(200).render('home',{user:userData})
        }else{
            res.render('home')
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).send('internal Server error')
    }
} 

// -----------Home page------------//
export const userLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.log(err);
    }
}