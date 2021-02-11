const mongoose = require("mongoose")

const Message = mongoose.model(
    "Message",
    new mongoose.Schema({
       fromUser: String,
       content: String,
       createdAt: {type: Date, default: Date.now}
    })
)

module.exports = Message