const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    orders: [{
        type: String
    }],
    role: { type: String, default: "user" }
})

module.exports = mongoose.model("user", userSchema)