export const notFoundHandler = (req,res,next)=>{
        res.status(404).render('404')
        next()
}
export const errorhandler = (err,req,res,next)=>{
    const stscode = res.statusCode == 200 ? 500 :res.statusCode
    console.log(res.statusCode)
    res.status(stscode)
    res.json({
        error:err?.message,
        stack:err?.stack
    })
    console.log(err?.stack)
}