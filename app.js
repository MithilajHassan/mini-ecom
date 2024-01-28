import user_route from './routes/userRoute.js'
import dbConnect from './config/dbConnect.js'
import { errorhandler, notFoundHandler } from './middlewares/errorHandling.js'
import admin_route from './routes/adminRoute.js'
import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import nocache from 'nocache'
// import MongoStore from 'connect-mongo'
// import methodOverride from 'method-override'

dotenv.config()
dbConnect()
const app = express()
const port =process.env.PORT || 7000

app.set('view engine','ejs')
app.set('views',['./views/user','./views/admin'])

app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    // store:new MongoStore({mongoUrl:process.env.MONGO_URI})
}))

app.use('/',user_route)
app.use('/admin',admin_route)

app.use(notFoundHandler,errorhandler)

app.listen(port,()=>{
    console.log(`Server started at http://localhost:${port}/admin`)
})