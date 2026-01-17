require('dotenv').config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
// mongoose.connect("");
const bcrypt=require("bcrypt");
const crypto=require("crypto");
const secrate=crypto.randomBytes(64).toString('hex');
console.log(secrate);