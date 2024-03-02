import Category from "../models/categoryModel.js"

//--------Category Management--------//
export const getCategoryMng = async(req,res)=>{
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
        const categoryData = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        })
        .limit(limit)
        .skip( (page-1) * limit)

        const categoryCount = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        }).countDocuments()
        res.status(200).render('category',{
            category: categoryData,
            isLogged: true,
            totalPages: Math.ceil(categoryCount/limit),
            currentPage: page,
            search: search || ''
        })
    } catch (err) {
        console.log(err)
    }
}
export const addCategory = async(req,res)=>{
    try {
        const name = req.body.name
        const existing = await Category.findOne({name})
        let search = req.query.search ? req.query.search : ''      
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 2
        const categoryData = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        })
        .limit(limit)
        .skip( (page-1) * limit)
        const categoryCount = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        }).countDocuments()
        if(!name.match(/^[a-zA-Z]{3,12}$/)){
            res.status(400).render('category',{
                mes:'Enter proper category',
                category: categoryData,
                isLogged: true,
                totalPages: Math.ceil(categoryCount/limit),
                currentPage: page,
                search: search || ''
            })
        }else if (existing) {
            res.status(409).render('category',{
                mes:'Catagory already exist',
                category: categoryData,
                isLogged: true,
                totalPages: Math.ceil(categoryCount/limit),
                currentPage: page,
                search: search || ''
            })                
        }else {
            const category = new Category({ name:name })
            await category.save()
            res.redirect('/admin/categoryManage')
        }  
    } catch (err) {
        console.log(err)
    }
}
export const removeCategory = async(req,res)=>{
    try {
        const id = req.body.id
        await Category.findOneAndUpdate({_id:id},{$set:{status:false}})       
        res.redirect('/admin/categoryManage')
    } catch (err) {
        console.log(err)
    }
}
export const recoverCategory = async(req,res)=>{
    try {
        const id = req.body.id
        await Category.findOneAndUpdate({_id:id},{$set:{status:true}})       
        res.redirect('/admin/categoryManage')
    } catch (err) {
        console.log(err)
    }
}
export const getEditCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const ctgryId = await Category.findOne({_id:id})
        let search = req.query.search ? req.query.search : ''      
        let page = req.query.page ?  parseInt(req.query.page) : 1
        const limit = 2
        const categoryData = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        })
        .limit(limit)
        .skip( (page-1) * limit)
        const categoryCount = await Category.find({
            name:{$regex:`.*${search}.*`,$options:'i'}
        }).countDocuments()

        res.status(200).render('editCategory',{
            ctgryId,
            category:categoryData,
            isLogged:true,
            totalPages: Math.ceil(categoryCount/limit),
            currentPage: page,
            search: search || ''
        })
    } catch (err) {
        console.log(err)
    }
}
export const editCategory = async(req,res)=>{
    try {       
        const {name,currentName,id} = req.body

        const existing = await Category.findOne({name})
        if(!name.match(/^[a-zA-Z]{3,12}$/)){
            const ctgryId = await Category.findOne({_id:id})
            let search = req.query.search ? req.query.search : ''      
            let page = req.query.page ?  parseInt(req.query.page) : 1
            const limit = 2
            const categoryData = await Category.find({
                name:{$regex:`.*${search}.*`,$options:'i'}
            })
            .limit(limit)
            .skip( (page-1) * limit)
            const categoryCount = await Category.find({
                name:{$regex:`.*${search}.*`,$options:'i'}
            }).countDocuments()
            res.status(200).render('editCategory',{
                mes:"Enter proper category",
                ctgryId,
                category:categoryData,
                isLogged:true,
                totalPages: Math.ceil(categoryCount/limit),
                currentPage: page,
                search: search || ''
            })
        }else if(existing && existing.name != currentName){
            const ctgryId = await Category.findOne({_id:id})
            let search = req.query.search ? req.query.search : ''      
            let page = req.query.page ?  parseInt(req.query.page) : 1
            const limit = 2
            const categoryData = await Category.find({
                name:{$regex:`.*${search}.*`,$options:'i'}
            })
            .limit(limit)
            .skip( (page-1) * limit)
            const categoryCount = await Category.find({
                name:{$regex:`.*${search}.*`,$options:'i'}
            }).countDocuments()
            res.status(200).render('editCategory',{
                mes:"Category is already exist",
                ctgryId,
                category:categoryData,
                isLogged:true,
                totalPages: Math.ceil(categoryCount/limit),
                currentPage: page,
                search: search || ''
            })
        }else{
            await Category.findOneAndUpdate({_id:id},{$set:{name}})   
            res.redirect('/admin/categoryManage') 
        }
    } catch (err) {
        console.log(err)
    }
}