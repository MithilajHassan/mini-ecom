import  express from "express"
import { adminGetLogin, adminLogout, getDashboard, getProductMng, verifyAdmin } from "../controllers/adminController.js"
import { isAdminLogged, isVeryfied } from "../middlewares/adminAuth.js"
const admin_route = express.Router()

admin_route.get('/',isAdminLogged,adminGetLogin)
admin_route.post('/',verifyAdmin)

admin_route.get('/dashboard',isVeryfied,getDashboard)

admin_route.get('/productManage',isVeryfied,getProductMng)



admin_route.get('/adminLogout',adminLogout)

admin_route.get('*',(req,res)=>{      
        res.redirect('/admin')   
})

export default admin_route