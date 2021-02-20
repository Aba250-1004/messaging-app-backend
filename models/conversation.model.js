const mongoose = require("mongoose")

const Conversation = mongoose.model(
    "Conversation",
    new mongoose.Schema({
       userIds: [{type: mongoose.ObjectId}],
       lastUserMessage: {type: Date, default: Date.now},
       messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message"
        }
       ] 
    })
)

module.exports = Conversation