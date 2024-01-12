import user_route from './routes/userRoute.js'
import dbConnect from './config/dbConnect.js'
import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import nocache from 'nocache'

dotenv.config()
dbConnect()
const app = express()
const port =process.env.PORT || 7000

app.set('view engine','ejs')
app.set('views','./views/user')

app.use(nocache())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
}))

app.use('/',user_route)

app.listen(port,()=>{
    console.log(`Server started at http://localhost:${port}`)
})