const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:String,
    email: String,
    password:String,
    city:String,
    number:Number
})

module.exports = mongoose.model("users", userSchema)