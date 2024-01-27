export const is_logged = (req,res,next)=>{
    if(req.session.user_id){
        res.redirect('/')
    }else{
        next()
    }
}

export const is_logout = (req,res,next)=>{
    if(req.session.user_id){
        next()
    }else{
        res.redirect('/')
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