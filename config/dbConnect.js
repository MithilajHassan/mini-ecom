import mongoose from 'mongoose'

const dbConnect = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connection successful'); 
    } catch (error) {
        console.log('connection error:'+error)
    }
} 

export default dbConnect
