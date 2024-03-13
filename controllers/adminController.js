import Admin from "../models/userModel.js"
import {compare} from 'bcrypt'
import multer from "multer"
import User from "../models/userModel.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"

//------------Multer--------//
const storage = multer.diskStorage({
    destination:'./public/productImgs',
    filename:(req,file,cb)=>{
            const name = Date.now()+'-'+file.originalname
            cb(null,name)
    }
})
export const upload = multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Only images are allowed!'))
        }
        cb(null, true);
    },limits:{
        fileSize: 1024 * 1024 * 10
    }
})


//--------Login for Admin-------//
export const adminGetLogin = async(req,res)=>{
    try {
        res.render('adminLogin')
    } catch (err) {
        console.log(err)
    }
}
export const verifyAdmin = async(req,res)=>{
    try {
        const adminData = await Admin.findOne({email:req.body.email})
        if(adminData){
            const passCheck = await compare(req.body.password,adminData.password)
            if (passCheck) {
                if(adminData.is_admin === true){
                    req.session.admin_id = adminData._id
                    res.redirect('/admin/dashboard')       
                }else{
                    res.status(401).render('adminLogin',{mes:'You are not Admin'})
                }
            }else{
                res.status(401).render('adminLogin', { mes: "Incorrect Password !!" })
            }
        }else{
            res.status(401).render('adminLogin', { mes: "Email not exist !!" }) 
        }
    } catch (err) {
        console.log(err)
    }
}

//--------Dashboard---------//
export const getDashboard = async(req,res)=>{
    try {
        const productsCount = await Product.find({is_there:true}).countDocuments()
        const orders = await Order.find({ "products.status": "Processing" })
        let ordersCount = 0
        orders.forEach((order)=>{
            order.products.forEach((prod)=>{
                if (prod.status ==='Processing') {
                    ordersCount +=1
                }
            })
        })

        const delivered = await Order.find({ "products.status": "Delivered" })
        let totalRevenue = 0
        let discount = 0
        delivered.forEach((order)=>{
            discount += order.discount
            order.products.forEach((prod)=>{
                if (prod.status ==='Delivered') {
                    totalRevenue += prod.price * prod.quantity
                }
            })
        })

        const results = await Order.aggregate([
            { $match: { "products.status": "Delivered" } },
        { $unwind: "$products" },
        { 
            $group: { 
                _id: "$products.productId", 
                totalQuantity: { $sum: "$products.quantity" } 
            } 
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        { 
            $lookup: {
                from: "products", 
                localField: "_id", 
                foreignField: "_id", 
                as: "productDetails" 
            }
        },
        { $unwind: "$productDetails" },
        { 
            $lookup: {
                from: "categories", 
                localField: "productDetails.category", 
                foreignField: "_id", 
                as: "categoryDetails" 
            }
        },
        { $unwind: "$categoryDetails" },
        { $project: { 
            productName: "$productDetails.name",
            productBrand: "$productDetails.brand",
            category: "$categoryDetails.name",
            totalQuantity: 1 
        }}
        ])        
        const quantities = results.map(result => result.totalQuantity)
        const products = results.map(result => result.productName)
        const brands = results.map(result => result.productBrand)

        const categoryQty = {}
        results.forEach(result => {
            const category = result.category
            const totalQuantity = result.totalQuantity
            
            if (categoryQty.hasOwnProperty(category)) {
                categoryQty[category] += totalQuantity
            } else {
                categoryQty[category] = totalQuantity
            }
        })
        res.status(200).render('dashboard',{products,quantities,brands,categoryQty,productsCount,totalRevenue:totalRevenue-discount,ordersCount})
    } catch (err) {
        console.log(err)
    }
}

//----------Customers------------//
export const getUsers = async(req,res)=>{
    try {
        let search = ''
        if(req.query.search){
            search = req.query.search
        }
        let page = 1
        if(req.query.page){
            page = parseInt(req.query.page)
        }
        const limit = 2
        const user = await User.find({
            is_admin:false,
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ]
        })
        .limit(limit)
        .skip( (page-1) * limit)

        const userCount = await User.find({
            is_admin:false,
            $or:[
                {name:{$regex:`.*${search}.*`,$options:'i'}}
            ]
        }).countDocuments()
        res.status(200).render('users',{
            user,
            isLogged:true,
            totalPages: Math.ceil(userCount/limit),
            currentPage: page,
            search: search || ''
        })
    } catch (err) {
        console.log(err)
    }
}
export const blockUser = async(req,res)=>{
    try {
        const id = req.body.id
        await User.findOneAndUpdate({_id:id},{$set:{is_blocked:true}})  
        res.status(200).redirect('/admin/users')
    } catch (err) {
        console.log(err)
    }
}
export const unBlockUser = async(req,res)=>{
    try {
        const id = req.body.id
        await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})       
        res.redirect('/admin/users')
    } catch (err) {
        console.log(err)
    }
}

//----------- Sales Report ------------//
export const getSalesReport = async(req,res)=>{
    try {
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 5
        let filterBy = req.query.filter || ''
        let fromDate, toDate

        switch (filterBy) {
            case 'day':
                fromDate = new Date()
                fromDate.setHours(0, 0, 0, 0)
                toDate = new Date()
                toDate.setHours(23, 59, 59, 999)
                break
            case 'week':
                fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7)
                break
            case 'month':
                fromDate = new Date()
                fromDate.setDate(1)
                toDate = new Date()
                toDate.setMonth(toDate.getMonth() + 1)
                toDate.setDate(0)
                break
            case 'year':
                fromDate = new Date()
                fromDate.setMonth(0)
                fromDate.setDate(1)
                toDate = new Date()
                toDate.setMonth(11)
                toDate.setDate(31)
                break
            case 'custom':
                fromDate = req.query.startDate ? new Date(req.query.startDate) : null
                toDate = req.query.endDate ? new Date(req.query.endDate) : null
                break
            default:
                fromDate = null
                toDate = null
                break
        }

        let ordersQuery = {'products.status': 'Delivered'}
        if (fromDate && toDate) {
            ordersQuery['products.deliveredAt'] = { $gte: fromDate, $lte: toDate }
        }
        const orders = await Order.find(ordersQuery).populate('products.productId')
        
        let totalSalesAmount = 0
        let tDiscount = 0
        const sales = orders.flatMap(order => {
            tDiscount += order.discount;
            return order.products.flatMap(product => {
                if (product.status === 'Delivered') {
                    totalSalesAmount += parseInt(product.price * product.quantity)
                    return [{
                        productId: product.productId._id,
                        productName: product.productId.name,
                        price: product.price,
                        quantity: product.quantity,
                        finalPrice: product.price * product.quantity,
                        discount: order.discount,
                        paymentMethod: order.payment,
                        date: product.deliveredAt
                    }]
                } else {
                    return []
                }
            })
        }).flat()
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        res.status(200).render('salesReport',{isLogged:true,sales:sales.slice(startIndex,endIndex),totalSalesAmount,tDiscount,filterBy,totalPages: Math.ceil(sales.length/limit),
        currentPage: page,})
    } catch (err) {
        console.log(err)
    }
}


//----------- Logout ------------//
export const adminLogout = async(req,res)=>{
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (err) {
        console.log(err)
    }
}

// export const getSalesReport = async(req,res)=>{
//     try {
        
//     } catch (err) {
//         console.log(err)
//     }
// }