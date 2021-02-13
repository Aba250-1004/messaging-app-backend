const mongoose = require("mongoose")

const Message = mongoose.model(
    "Message",
    new mongoose.Schema({
       fromUserId: mongoose.ObjectId,
       msgBody: String,
       createdAt: {type: Date, default: Date.now}
    })
)

module.exports = Message