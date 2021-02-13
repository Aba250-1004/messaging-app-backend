const config = require('../config/auth.config')
const db = require('../models/index')
// Access to our db through User and Role varible
const Conversation = db.conversation
const Message = db.message
const User = db.user

exports.createConversationWithNewMessage = (req,res) => {
    let currentUser = null
    User.findOne({
        userName:req.body.userName
    }).exec((err, user) => {
        if (err){
            return res.send({message:"current user does not exist!"})
        }else{
            let otherUsersId = []
            // console.log(req.body.otherUserNames)
            for(let userName of req.body.otherUserNames){
                User.find({
                    userName:userName
                }).exec((err,otherUser) => {
                    if (err){
                        return res.send({message:"user: "+ userName +" does not exist cannot add to conversation"})
                    }else{
                        console.log("other user: "+otherUser)
                        otherUsersId.push(otherUser._id)
                    }
                })
            }
            if (user){
                console.log("current user: "+user)
                const message = new Message({
                    fromUserId: user._id,
                    msgBody: req.body.msgBody
                })
        
                message.save((err, message) => {
                    if (err) {
                        res.status(500).send({message: err, type:'message'})
                        return
                    }
                })
        
                const conversation = new Conversation({
                    userIds: [user._id, ...otherUsersId],
                    messages: [message]
                })
        
                conversation.save((err, conversation) => {
                    if (err) {
                        res.status(500).send({message: err, type:'conversation'})
                        return
                    }else{
                        return res.send({conversation:conversation, message: message})
                    }
                })
            }

        }
    })
}


exports.sendMessageToExistingGroup = (req,res) => {
    let currentUser = null
    User.findOne({
        userName:req.body.userName
    }).exec((err, user) => {
        if (err){
            return res.send({message:"current user does not exist!"})
        }else{
            currentUser = user
            let otherUsersId = []
            for(let userName of req.body.otherUserNames){
                User.findOne({
                    userName:userName
                }).exec((err,user) => {
                    if (err){
                        return res.send({message:"user: "+ userName +" does not exist cannot add to conversation"})
                    }else{
                        otherUsersId.push(user._id)
                    }
                })
            }
        }
    })

    if (currentUser){
        const message = new Message({
            fromUserId: currentUser._id,
            msgBody: req.body.msgBody
        })

        Conversation.findOne({
            userIds: [currentUser, ...otherUsersId]
        }).exec((err, conversation) => {
            if (err){
                return res.send({message: "conversation can't be found"})
            }else{
                conversation.messages.push(message)
                return res.status(202).send({messages:conversation})
            }
        })
    }
}   

exports.getConversationLatestMessages = (req,res) => {
    
}   

