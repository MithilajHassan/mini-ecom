export const isAdminLogged = (req,res,next)=>{
    if(req.session.admin_id){
        res.redirect('/admin/dashboard')
    }else{
     next()   
    }
}

export const isAdmin = (req,res,next)=>{
    if(req.session.admin_id){
        next()
    }else{
        res.redirect('/admin')
    }
}
