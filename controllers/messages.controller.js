const config = require('../config/auth.config')
const db = require('../models/index')
// Access to our db through User and Role varible
const Conversation = db.conversation
const Message = db.message
const User = db.user

exports.createConversationWithNewMessage = (req,res) => {
            // console.log(req.body.otherUserNames)
            User.find({
                userName: {$in: [req.body.userName,...req.body.otherUserNames]}
            }).exec((err,users) => {
                if (err){
                    return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
                }else{
                    let otherUsersId = []
                    for (let i = 1; i < users.length; i++){
                        otherUsersId.push(users[i]._id)
                    }
                    console.log("Users: "+ users)
                    const message = new Message({
                        fromUserId: users[0]._id,
                        msgBody: req.body.msgBody
                    })
            
                    message.save((err, message) => {
                        if (err) {
                            res.status(500).send({message: err, type:'message'})
                            return
                        }
                    })
            
                    const conversation = new Conversation({
                        userIds: [users[0]._id, ...otherUsersId],
                        messages: [message]
                    })
            
                    conversation.save((err, conversation) => {
                        if (err) {
                            return res.status(500).send({message: err, type:'conversation'})
                        }else{
                            return res.send({conversation:conversation, message: message})
                        }
                    })
                }
            })
        }



exports.sendMessageToExistingGroup = (req,res) => {
    User.find({
        userName: {$in:[req.body.userName,...req.body.otherUserNames]}
    }).exec((err, users) => {
        if (err){
            return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
        }else{
            let otherUsersId = []
            for (let i = 1; i < users.length; i++){
                otherUsersId.push(users[i]._id)
            }
            console.log("Users: "+ users)
            const message = new Message({
                fromUserId: users[0]._id,
                msgBody: req.body.msgBody
            })
    
            message.save((err, message) => {
                if (err) {
                    res.status(500).send({message: err, type:'message'})
                    return
                }
            })

            Conversation.findOne({
                userIds: [users[0]._id, ...otherUsersId]
            }).exec((err, conversation) => {
                if (err){
                    res.send({message: "Conversation does not exist!"})
                }else{
                    conversation.messages.push(message)

                    conversation.save((err, conversation) => {
                        if (err) {
                            return res.status(500).send({message: err, type:'conversation'})
                        }else{
                            return res.send({conversation:conversation, message: message})
                        }
                    })
                }
            })
        }
    })
}   

exports.getConversation = (req,res) => {
    User.find({
        userName: {$in:[req.body.userName,...req.body.otherUserNames]}
    }).exec((err, users) => {
        if (err){
            return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
        }else{
            let otherUsersId = []
            for (let i = 1; i < users.length; i++){
                otherUsersId.push(users[i]._id)
            }

            Conversation.findOne({
                userIds: [users[0]._id, ...otherUsersId]
            }).exec((err, conversation) => {
                if (err){
                    return res.send({message: "Conversation does not exist!"})
                }else{
                    return res.send({conversation: conversation})
                }
            })
        }
    })
}   

