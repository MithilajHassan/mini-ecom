import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import fs from 'fs'

//--------Product Management---------//
export const getProductMng = async(req,res)=>{
    try {
        let search = ''
        if(req.query.search){
            search = req.query.search
        }
        let page = 1
        if(req.query.page){
            page = parseInt(req.query.page)
        }
        const limit = 3
        const product= await Product.find({is_there:true,
            $or:[
            {name: { $regex:`.*${search}.*`, $options: 'i' }}
            ]
        })
        .limit(limit)
        .skip( (page-1) * limit)

        const productCount = await Product.find({is_there:true,
            $or:[
            {name: { $regex:`.*${search}.*`, $options: 'i' }}
            ]
        }).countDocuments()
        const category = await Category.find({status:true})
        res.status(200).render('products/productManage',{
            isLogged: true,
            product,
            category,
            totalPages: Math.ceil(productCount/limit),
            currentPage: page,
            search: search || '',
        })
    } catch (err) {
        console.log(err)
    }
}
export const getAddProduct = async(req,res)=>{
    try {
        const category = await Category.find({status:true})
        res.status(200).render('products/addProduct',{isLogged:true,category})
    } catch (err) {
        console.log(err)
    }
}
export const productAdding = async(req,res)=>{
    try {
        const product = new Product({
            name:req.body.name,
            brand:req.body.brand,
            category:req.body.category,
            description:req.body.description,
            price:req.body.price,
            quantity:req.body.quantity,
            images:req.files
        })
        await product.save()
        res.redirect("/admin/productManage")
    } catch (err) {
        console.log(err)
    }
}
export const getEditProduct = async(req,res)=>{
    try {
        const id = req.query.id   
        const product = await Product.findById({_id:id})
        const category = await Category.find({status:true})
        res.status(200).render('products/editProduct',{product,category,isLogged:true})
    } catch (err) {
        console.log(err)
    }
}
export const editProduct = async(req,res)=>{
    try {
        const {name,brand,category,description,price,quantity,id} = req.body
        await Product.findByIdAndUpdate({_id:id},{$set:{name,brand,category,description,price,quantity}})
        res.status(200).redirect('/admin/productManage') 
    } catch (err) {
        console.log(err)
    } 
}
export const editImage = async(req,res)=>{
    try {
        const {productId,imgIndex} = req.body
        const image = req.file
        const  product = await Product.findById({_id:productId})
        const oldImage = product.images[imgIndex]
        const imagePath = `./public/productImgs/${oldImage.filename}`
        fs.unlinkSync(imagePath)
        product.images.splice(imgIndex,1,image)
        await product.save()
        res.redirect(`/admin/editProduct?id=${productId}`)
    } catch (err) {
        console.log(err)
    }
}
export const removeProduct = async(req,res)=>{
    try {
        const id = req.body.id
        await Product.findOneAndUpdate({_id:id},{$set:{is_there:false}})
               
        res.status(200).redirect('/admin/productManage')
    } catch (err) {
        console.log(err)
    }
}
