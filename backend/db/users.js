import { minLength } from "zod";

const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name :{
        type: String,
        required :true
    },
    email : {
        type:String,
        required:true,
        unique : true
    },
    password : {
        type: String,
        required :true,
        select:false
    },
    username :{
        type : String,
        required :true,
        unique : true,
        lowercase:true
    },hashedPin:{
        type: String,
        required :true,
        select:false,
    },
    active:{
        type : Boolean,
        default :true
    },
    role:{
        type:String,
        enum : ["User","admin"],
        default:"User"
    }
},{timestamps : true});

export const User=mongoose.model('users',userSchema);