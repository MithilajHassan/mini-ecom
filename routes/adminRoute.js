import express from "express"
import { addCategory, adminGetLogin, adminLogout, blockUser, editCategory, editProduct, getAddProduct, getCategoryMng, getDashboard, getEditCategory, getEditProduct, getProductMng, getUsers,
         productAdding, recoverCategory, recoverProduct, removeCategory, removeProduct, unBlockUser, upload, verifyAdmin } from "../controllers/adminController.js"
import { isAdmin, isAdminLogged } from "../middlewares/adminAuth.js"
const admin_route = express.Router()


admin_route.get('/', isAdminLogged, adminGetLogin)
admin_route.post('/', isAdminLogged, verifyAdmin)

//--------Dashboard---------------//
admin_route.get('/dashboard', isAdmin, getDashboard)

//--------Product---------------//
admin_route.get('/productManage', isAdmin, getProductMng)
admin_route.get('/addProduct', isAdmin, getAddProduct)
admin_route.post('/addProduct', isAdmin, upload.array('images',3), productAdding)
admin_route.get('/editProduct',isAdmin,getEditProduct)
admin_route.post('/editProduct',isAdmin,editProduct)
admin_route.post('/removeProduct',isAdmin,removeProduct)
admin_route.post('/recoverProduct',isAdmin,recoverProduct)

//--------Customers---------------//
admin_route.get('/users', isAdmin,getUsers)
admin_route.post('/block',isAdmin,blockUser)
admin_route.post('/unblock',isAdmin,unBlockUser)

//--------Category---------------//
admin_route.get('/categoryManage',isAdmin,getCategoryMng)
admin_route.post('/categoryManage',isAdmin,addCategory)
admin_route.get('/editCategory',isAdmin,getEditCategory)
admin_route.post('/editCategory',isAdmin,editCategory)
admin_route.post('/removeCategory',isAdmin,removeCategory)
admin_route.post('/recoverCategory',isAdmin,recoverCategory)

//-------------Logout------------//
admin_route.get('/adminLogout', isAdmin, adminLogout)

admin_route.get('*', (req, res) => {
        res.redirect('/admin')
})

export default admin_route