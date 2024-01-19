import express from "express"
import { adminGetLogin, adminLogout, getAddProduct, getDashboard, getProductMng, getUsers, prodictAdding, upload, verifyAdmin } from "../controllers/adminController.js"
import { isAdmin, isAdminLogged } from "../middlewares/adminAuth.js"
const admin_route = express.Router()


admin_route.get('/', isAdminLogged, adminGetLogin)
admin_route.post('/', verifyAdmin)

admin_route.get('/dashboard', isAdmin, getDashboard)

//--------Product---------------//
admin_route.get('/productManage', isAdmin, getProductMng)
admin_route.get('/addProduct', isAdmin, getAddProduct)
admin_route.post('/addProduct', upload.array('images', 3), prodictAdding)

//--------customers---------------//
admin_route.get('/users',isAdmin,getUsers)


//-------------Logout------------//
admin_route.get('/adminLogout', adminLogout)

admin_route.get('*', (req, res) => {
        res.redirect('/admin')
})

export default admin_route