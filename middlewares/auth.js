export const is_logged = (req,res,next)=>{
    if(req.session.user_id){
        res.redirect('/home')
    }else{
        next()
    }
}
