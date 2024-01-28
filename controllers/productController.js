import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import User from "../models/userModel.js"

//-------user sdie product page-------//
export const productDetails = async(req,res)=>{
    try {
        const id = req.params.id
        const categoryData = await Category.find({status:true})
        const productData = await Product.findById({_id:id})
        if(req.session.user_id){
            const userData = await User.findById({_id:req.session.user_id})
            if(userData.is_blocked == true){
                res.status(403).render('login',{bUser:userData})
            }else{
                res.status(200).render('productDetails',{user:userData,product:productData,category:categoryData,user:userData})
            }           
        }else{
            res.status(200).render('productDetails',{product:productData,category:categoryData})
        }      
    } catch (err) {
        console.log(err)
    }
}



//--------Product Management---------//
export const getProductMng = async(req,res)=>{
    try {
        const product= await Product.find()
        res.status(200).render('products/productManage',{isLogged:true,product})
    } catch (err) {
        console.log(err)
    }
}
export const getAddProduct = async(req,res)=>{
    try {
        res.status(200).render('products/addProduct',{isLogged:true})
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
        const productData = await product.save()
        if (productData) {
            res.redirect("/admin/productManage")
        }else{
            res.send('failed please try again')
        }
    } catch (err) {
        console.log(err)
    }
}
export const getEditProduct = async(req,res)=>{
    try {
        const id = req.query.id   
        const product = await Product.findById({_id:id})
        res.status(200).render('products/editProduct',{product,isLogged:true})
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
export const removeProduct = async(req,res)=>{
    try {
        const id = req.body.id
        await Product.findOneAndUpdate({_id:id},{$set:{is_there:false}})       
        res.status(200).redirect('/admin/productManage')
    } catch (err) {
        console.log(err)
    }
}
export const recoverProduct = async(req,res)=>{
    try {
        const id = req.body.id
        await Product.findOneAndUpdate({_id:id},{$set:{is_there:true}})       
        res.status(200).redirect('/admin/productManage')   
    } catch (err) {
        console.log(err)
    }
}