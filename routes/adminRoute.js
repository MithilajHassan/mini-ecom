import express from "express"
import { adminGetLogin, adminLogout, getAddProduct, getDashboard, getProductMng, prodictAdding, upload, verifyAdmin } from "../controllers/adminController.js"
import { isAdminLogged, isVeryfied } from "../middlewares/adminAuth.js"
const admin_route = express.Router()


admin_route.get('/',isAdminLogged,adminGetLogin)
admin_route.post('/',verifyAdmin)

admin_route.get('/dashboard',isVeryfied,getDashboard)

admin_route.get('/productManage',isVeryfied,getProductMng)
admin_route.get('/addProduct',isVeryfied,getAddProduct)
admin_route.post('/addProduct',upload.array('images',3),prodictAdding)

admin_route.get('/adminLogout',adminLogout)

admin_route.get('*',(req,res)=>{      
        res.redirect('/admin')   
})

export default admin_route