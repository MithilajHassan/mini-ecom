import user_route from './routes/userRoute.js'

import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'

mongoose.connect(`mongodb://127.0.0.1:27017/luminovadb`).then((ans) => { 
    console.log("Connected Successfully") 
}).catch((err) => { 
    console.log("Error in the Connection:"+err) 
}) 


const app = express()

app.set('view engine','ejs')
app.set('views','./views/user')

app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(session({
    secret:"g37yd47d647ey382wu",
    resave:false,
    saveUninitialized:false,
}))

app.use('/',user_route)

app.listen(7000,()=>{
    console.log(`Server started at http://localhost:7000`)
})