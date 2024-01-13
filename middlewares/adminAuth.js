export const isAdminLogged = (req,res,next)=>{
    if(req.session.admin_id){
        res.redirect('/admin/dashboard')
    }else{
     next()   
    }
}