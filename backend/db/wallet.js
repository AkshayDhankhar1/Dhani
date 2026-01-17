const mongoose=require("mongoose");
const walletSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true

    },
    balance:{
        type:Number,
        min:0,
        required:false,
        default:5000
    },
    curr:{
        type:String,
        enum:["INR"],
        default:"INR"
    },
    status:{
        type:String,
        enum:["Active","Freezed","Closed"],
        default:"Active"
    }
},{timestamps:true});

export const wallet=mongoose.model("Wallet",walletSchema);