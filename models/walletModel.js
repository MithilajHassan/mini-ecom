import { Schema, model } from "mongoose";

const walletSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        ref:'User',
        require:true
    },
    amount:{
        type:Number,
        require:true
    },
    type: {
        type: String,
        enum: ['Deposit','Purchase', 'Refund'],
        required: true
    },
    CreatedAt:{
        type:Date,
        default:Date.now,
        require:true
    }
})
const WalletHistory = model('WalletHistory',walletSchema)
export default WalletHistory