const mongoose = require("mongoose")

const Conversation = mongoose.model(
    "Conversation",
    new mongoose.Schema({
       users: [String],
       content: String,
       messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message"
        }
       ] 
    })
)

module.exports = Conversation