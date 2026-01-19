const mongoose = require("mongoose");
const User = require("../db/users");
const Wallet = require("../db/wallet");
const Transaction = require("../db/transaction");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.transferMoney = async (req, res) => {
    const senderId = req.user.id;
    const body = req.body;

    const receiverUsername = body.receiverUsername;
    const amount = body.amount;
    const pin = body.pin;

    if (amount < 1) {
        return res.status(400).json({
            msg: "please send a valid amount "
        });
    }
    console.log("Valid Amount ✅")
    //////////////////----------try 1----------------/////////////////////////
    let session;
    let tx;
    try {
        const sender = await User.findOne({ _id: senderId })
            .select("hashedPin")
            .select("active");

        if (!sender) {
            return res.status(400).json({
                msg: "Invalid sender"
            });
        }

        console.log("Sender Found ✅")

        if (sender.active !== true) {
            return res.status(400).json({
                msg: "You can not send money because you are not active"
            });
        }

        console.log("sender is active ✅")

        const senderWallet = await Wallet.findOne({ user: senderId });

        if (!senderWallet) {
            return res.status(400).json({
                msg: "Sender wallet does not exist"
            });
        }

        if (senderWallet.status !== "Active") {
            return res.status(400).json({
                msg: "Your wallet is either frozen or closed"
            });
        }

        console.log("sender wallet is active ✅")

        const receiver = await User.findOne({ username: receiverUsername })
            .select("active");
            
        if (!receiver) {
            return res.status(400).json({
                msg: "Invalid receiver"
               });
        }
        if(senderId==receiver._id.toString()){
            return res.status(400).json({
                msg:"You are sending money to yourself"
            })
        }

        console.log("receiver found ✅")

        if (receiver.active !== true) {
            return res.status(400).json({
                msg: "You can not send money because receiver is inactive"
            });
        }

        const receiverWallet = await Wallet.findOne({ user: receiver._id });

        if (!receiverWallet) {
            return res.status(400).json({
                msg: "Receiver does not have a wallet ❌"
            });
        }

        if (receiverWallet.status !== "Active") {
            return res.status(400).json({
                msg: "Receiver's wallet is either closed or frozen"
            });
        }

        console.log("Receiver Wallet is Active ✅")

        const isMatch=await bcrypt.compare(pin,sender.hashedPin);
        if(!isMatch){
            return res.status(400).json({
                msg :"You entered wrong pin ❌"
            })
        }

        console.log("Valid Pin ✅")

        if(senderWallet.balance<amount){
            return res.status(400).json({
                msg:"You don't have sufficient money ❌"
            })
        }

        console.log("valid Balance ✅")
        // try{
        session = await mongoose.startSession(); 
        session.startTransaction();
        console.log("Session Started ✅")
        const senderWalletTx=await Wallet.findOne({user : senderId}).session(session);
        if(!senderWalletTx){
            throw new Error("sender wallet does not exists")
        }
        const receiverWalletTx=await Wallet.findOne({user :receiver._id}).session(session);
        if(!receiverWalletTx){
            throw new Error("Receiver wallet not found during transaction")
        }
        if(senderWalletTx.balance<amount){
            throw new Error("Insufficient balance");
        }
        tx=new Transaction({
            transactionId:crypto.randomUUID(),
            fromWallet : senderWalletTx._id,
            toWallet : receiverWalletTx._id,
            amount:amount,
            status:"pending"
        })
        console.log("Transaction formed ✅")
        await tx.save({session});
        senderWalletTx.balance-=amount;
        receiverWalletTx.balance+=amount;
        await senderWalletTx.save({session});
        await receiverWalletTx.save({session});
        tx.status="success";
        await tx.save({session});
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            msg :"Money sent successfully ✅"
        })
    }
        //     catch(err){                               // catch 2
        //            if(session) {console.log(err);
        //         await session.aortTransaction();
        //         session.endSession();
        //         return res.status(400).json({
        //             err : err.message}
        //         );}
        //    }


    // } ////////////////----------------catch 2-------------------//////////////// 
    catch (err) {
        console.log(err);
        if(session){
            await session.abortTransaction();
            session.endSession();
        }
        if(tx){
            tx.status="failed";
            tx.failureReason=err.message ||"UNknown error";
            await tx.save();
        }
        return res.status(400).json({
            msg: "something went wrong ❌"
        });
    }
};
