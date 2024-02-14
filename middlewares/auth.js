import User from "../models/userModel.js"

export const is_logged = (req,res,next)=>{
    if(req.session.user_id){
        res.redirect('/')
    }else{
        next()
    }
}

// export const is_logout = (req,res,next)=>{
//     if(req.session.user_id){
//         next()
//     }else{
//         res.redirect('/login')
//     }
// }

export const is_logout = async(req,res,next)=>{
    if(req.session.user_id){
        const userData = await User.findById({_id:req.session.user_id})
        if(userData.is_blocked == true){              
            res.status(403).render('login',{bUser:userData})
        }else{
            next()
        }            
    }else{
        res.redirect('/login')
    }
}



//------OTP page checking
export const isOtpSent = (req,res,next)=>{
    if(req.session.otpSented){
        next()
    }else{
        res.redirect('/')
    }
}