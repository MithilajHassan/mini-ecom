import  express from "express"
import { adminGetLogin, getDashboard, verifyAdmin } from "../controllers/adminController.js"
import { isAdminLogged } from "../middlewares/adminAuth.js"
const admin_route = express.Router()

admin_route.get('/',isAdminLogged,adminGetLogin)
admin_route.post('/',verifyAdmin)

admin_route.get('/dashboard',isAdminLogged,getDashboard)


// admin_route.get('*',(req,res)=>{   
//     try {
//         res.redirect('/admin')
//     } catch (error) {
//         console.log(error)
//     }
// })

export default admin_route