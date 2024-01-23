export const isAdminLogged = (req,res,next)=>{
    if(req.session.admin_id){
        res.redirect('/admin/dashboard')
    }else{
     next()   
    }
}

export const isAdmin = (req,res,next)=>{
    if(req.session.admin_id){
        // console.log('session is here')
        next()
    }else{
        res.redirect('/admin')
    }
}
