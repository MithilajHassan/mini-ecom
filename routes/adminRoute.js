import express from "express"
import {adminGetLogin, adminLogout, blockUser, getDashboard, getSalesReport, getUsers, unBlockUser, upload, verifyAdmin } from "../controllers/adminController.js"
import { isAdmin, isAdminLogged } from "../middlewares/adminAuth.js"
import { applyProductOffer, editImage, editProduct, getAddProduct, getEditProduct, getProductMng, productAdding, removeProduct } from "../controllers/productController.js"
import { allOrders, orderCancelling, orderDelivered, orderDetails, orderPending } from "../controllers/orderController.js"
import { addCategory, applyCategoryOffer, editCategory, getCategoryMng, getEditCategory, recoverCategory, removeCategory } from "../controllers/categoryController.js"
import { addCoupon, couponListing, editCoupon, getEditCoupon, loadCouponMng, removeCoupon } from "../controllers/couponController.js"
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
admin_route.post('/editImage',isAdmin,upload.single('image'),editImage)
admin_route.post('/applyProductOffer',isAdmin,applyProductOffer)

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
admin_route.post('/applyCategoryOffer',isAdmin,applyCategoryOffer)

//--------Orders---------------//
admin_route.get('/allOrders',isAdmin,allOrders)
admin_route.post('/orderDelivered',isAdmin,orderDelivered)
admin_route.post('/orderCancelling',isAdmin,orderCancelling)
admin_route.post('/orderPending',isAdmin,orderPending)
admin_route.get('/detailsOfOrder',isAdmin,orderDetails)

//----------- Sales Report ------------//
admin_route.get('/salesReport',isAdmin,getSalesReport)

//--------Coupons---------------//
admin_route.get('/couponManage',isAdmin,loadCouponMng)
admin_route.post('/addCoupon',isAdmin,addCoupon)
admin_route.get('/editCoupon',isAdmin,getEditCoupon)
admin_route.post('/editCoupon',isAdmin,editCoupon)
admin_route.post('/removeCoupon',isAdmin,removeCoupon)
admin_route.post('/listCoupon',isAdmin,couponListing)


//-------------Logout------------//
admin_route.get('/adminLogout', isAdmin, adminLogout)

admin_route.get('*', (req, res) => {
        res.redirect('/admin')
})

export default admin_route