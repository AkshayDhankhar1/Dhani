const Wallet=require("../db/wallet");
const Transaction = require("../db/transections");

exports.getMyWallet=async(req,res)=>{
    try{
        const userId=req.user.id;
        const wallet=await Wallet.findOne({user:userId});
        if(!wallet){
            throw new Error("Wallet not found");
        }
        res.json({
            balance : wallet.balance,
            currency: wallet.curr,
            status : wallet.status
        })
    }
    catch(err){
        res.status(404).json({message:"Server Error"});
    }
}
exports.getMyTransactions=async (req,res)=>{
    try{const userId=req.user.id;
    const wallet =await Wallet.findOne({user : userId});
    if(!wallet){
        throw new Error("Wallet not found");
    }
    const txs=await Transaction.find({
        $or :[
            {fromWallet : wallet._id},
            {toWallet : wallet._id}
        ]
    }).sort({createdAt :-1}).limit(50);
    res.json(txs);
    }catch(err){
        console.log(err);
        return res.status(404).json({
            msg :"Something went wrong"
        })
    }
}