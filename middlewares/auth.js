export const is_logged = (req,res,next)=>{
    if(req.session.user_id){
        res.redirect('/')
    }else{
        next()
    }
}

export const is_login = (req,res,next)=>{
    if (req.session.user_id) {
        next()
    } else {
        res.redirect('/l')
    }
}