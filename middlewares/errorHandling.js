export const notfoundHandler = (req,res,next)=>{
        res.status(404).send("<h1>404</h1> <h1>Not Found</h1>")
        next()
}
export const errorhandler = (err,req,res,next)=>{
    const stscode = res.statusCode == 200 ? 500 :res.statusCode
    log(res.statusCode)
    res.status(stscode)
    res.json({
        error:err?.message,
        stack:err?.stack
    })
    console.log(err?.stack)
}