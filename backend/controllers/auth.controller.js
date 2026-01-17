const { default: mongoose } = require("mongoose");
const User=require("../db/users");
const Wallet=require("../db/wallet");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
exports.signup=  async(req,res)=>{
    try{
        //1. take data from body
        //2. validate if user exists upi pin exectly 6 letters
        //3. security password upi pin hash
        //4. db user create wallet auto create
        //5. response
        const bod=req.body;
        const username=bod.username;
        const name=bod.name;
        const email=bod.email;
        const password=bod.password;
        const pin=bod.pin;
        if(!/^\d{6}$/.test(pin)){
            return res.status(400).json({msg : "you entered wrong pin"});
        }
        const f=await User.findOne({email: email});
        const t=await User.findOne({username : username});
        if(f){
            return res.status(400).json({
                msg : "Email Already exists"
            })
        }
        if(t){
            return res.status(400).json({
                msg :"Username already exists"
            })
        }
        const hashedPass=await bcrypt.hash(password,10);
        const hashedPin=await bcrypt.hash(pin,10);
        const newUser=new User({
            name :name,
            email :email,
            password:hashedPass,
            username :username,
            hashedPin: hashedPin
        })
        const newWallet=new Wallet({
            user:newUser._id
        })
        const session=await mongoose.startSession();
        await session.startTransaction();
        try{
        await newUser.save({session});
        await newWallet.save({session});
        await session.commitTransaction();
        }catch(err){
            console.log(err);
            await session.abortTransaction();
            return res.status(400).json({
                msg: "problem making a user"
            })
        }
        await session.endSession();

        res.json({
            msg :"Signup Successful with signup bonous of ₹5000",
            username : username
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            error :err.message
        })

    }
}
exports.login=async(req,res)=>{
    const body=req.body;
    const email=body.email;
    const userpassword=body.password;
    try{const user=await User.findOne({email : email}).select("+password");
    if(!user){
        return res.status(404).json({
            msg:"user does not exists"
        })
    }
    const isMatch=await bcrypt.compare(userpassword,user.password);
    if(!isMatch){
        return res.status(401).json({msg :"Wrong password"})
    }
    const token=await jwt.sign({userId : user._id},process.env.JWT_SECRET,{expiresIn : "4d"});
    res.json({msg: "login successfull",token :token,user:{id :user._id,username :user.username,role :user.role}});
}catch(err){
    console.log(err);
    return res.status(400).json({
        msg:err
    })
}
}