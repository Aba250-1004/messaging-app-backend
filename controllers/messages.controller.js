const { compareSync } = require('bcryptjs')
const config = require('../config/auth.config')
const { conversation } = require('../models/index')
const db = require('../models/index')
// Access to our db through User and Role varible
const Conversation = db.conversation
const Message = db.message
const User = db.user

exports.createConversationWithNewMessage = (req,res) => {
            console.log("create convo")
            console.log(req.body.userName)
            console.log(req.body.otherUserNames)
            User.find({
                userName: {$in: [req.body.userName,...req.body.otherUserNames]}
            }).exec((err,users) => {
                // console.log("error: "+err)
                // console.log("users: "+users)
                if (users.length !== [req.body.userName,...req.body.otherUserNames].length || 0 === req.body.otherUserNames.length ){
                    console.log("didn't allow")
                    return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
                }else{
                    console.log("allowed")
                    let otherUsersId = []
                    for (let i = 1; i < users.length; i++){
                        otherUsersId.push(users[i]._id)
                    }
                    User.findOne({
                        userName: req.body.userName
                    }).exec((err, user) =>{
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
                            userIds: [users[0]._id, ...otherUsersId],
                            messages: [message]
                        })
                
                        conversation.save((err, conversation) => {
                            if (err) {
                                return res.status(500).send({message: err, type:'conversation'})
                            }else{
                                console.log({conversation:conversation, message: message})
                                return res.send({conversation:conversation, message: message})
                            }
                        })
                    })  
                    
                }
            })
        }



exports.sendMessageToExistingGroup = (req,res) => {
    console.log(req.body.otherUserNames)
    console.log(req.body.userName)
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
            User.findOne({
                userName: req.body.userName
            }).exec((err, user) => {
                console.log("user: ")
                console.log(user)
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
    
                Conversation.findOne({
                    userIds: [users[0]._id, ...otherUsersId]
                }).exec((err, conversation) => {
                    if (err){
                        res.send({message: "Conversation does not exist!"})
                    }else{
                        Conversation.findOneAndUpdate({_id:conversation._id},{lastUserMessage:Date.now()}).exec((err, conversation) => {
                            console.log("date.now = "+ Date.now())
                            console.log(conversation)
                            conversation.messages.push(message)
                            
        
                            conversation.save((err, conversation) => {
                                if (err) {
                                    return res.status(500).send({message: err, type:'conversation'})
                                }else{
                                    return res.send({conversation:conversation, message: message})
                                }
                            })
                        })
                        
                    }
                })
            })
           
        }
    })
}   

exports.getConversation = (req,res) => {
    // console.log("hit get convo")
    // console.log("req.body.otherUserNames: "+req.body.otherUserNames)
    // console.log("req.params.userName: "+req.params.userName)
    // User.find({
    //     userName: {$in:[req.params.userName,...req.body.otherUserNames]}
    // }).exec((err, users) => {
    //     if (users.length !== [req.body.userName,...req.body.otherUserNames].length){
    //         return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
    //     }else{
    //         let otherUsersId = []
    //         for (let i = 1; i < users.length; i++){
    //             otherUsersId.push(users[i]._id)
    //         }   
            // console.log(req.params.id)

            Conversation.findOne({
                _id: req.params.id
            }).exec((err, conversation) => {
                // console.log("conversation: "+conversation)
                if (!conversation){
                    return res.send({message: "Conversation does not exist!"})
                }else{
                    // console.log(conversation)
                    // console.log(conversation.messages)
                    Message.find({
                        _id:{$in:conversation.messages}
                    }).sort({
                        createdAt: "desc"
                    }).exec((err, messages) => {
                        let ids = []
                        // console.log(conversation)
                        for(let id of conversation.userIds){
                            ids.push(id)
                        }
                        // console.log("userMessageIds: "+ids)
                        User.find({
                            _id:{$in:ids}
                        }).exec((err, users) => {
                            let userNames = []
                            console.log(users)
                            for (let user of users){
                                let toPush = {userName : user.userName, id: user._id}
                                userNames.push(toPush)
                            }
                            console.log("messages:")
                            console.log(messages)

                            // let messageFromUserId = []
                            // for (let message of messages){
                            //     messageFromUserId.push(message.fromUserId)
                            // }
                            // User.find({
                            //     _id:{$in:messageFromUserId}
                            // }).exec((err, users)=> {

                            // })

                            return res.send({conversation: conversation, messages: messages, userNames: userNames})
                        })
                    })
                    
                }
            })
        }

exports.getUserConversations = (req, res) => {
    // console.log("hit get user convos")
    // console.log("req.body.username: "+req.params.userName)
    User.findOne({
        userName:req.params.userName
    }).exec((err, user) => {
        // console.log("user: "+ user)
        Conversation.find({
            userIds:user._id
        }).exec((err, conversation) => {
            let messageIds = []
            // console.log(conversationIds)
            for (let convos of conversation){
                messageIds.push(convos.messages[convos.messages.length -1])
            }
            Message.find({
                _id:{$in:messageIds}
            }).exec((err, messages) => {
                Conversation.find({
                    message:messages._id
                }).sort({
                    lastUserMessage: "desc"
                }).exec((err, conversation) => {
                    console.log("conversation matching: "+conversation)
                    let usersInConvo = []
                    console.log(conversation)
                    let conversationTimes = []
                    let conversationIds = []
                    for (let convo of conversation){
                        usersInConvo.push(convo.userIds)
                        conversationTimes.push(convo.lastUserMessage)
                        conversationIds.push(convo._id)
                    }
                    usersInConvoFlat = usersInConvo.flat(1)
                    User.find({
                        _id:{$in:usersInConvoFlat}
                    }).exec((err, users) => {
                        let userConversationToRet = []
                        for (let convoArray of usersInConvo){
                            let toPush = []
                            for(let i = 0; i < convoArray.length; i++){
                                for (let user of users){
                                    if (user._id.toString() == convoArray[i].toString()){
                                        toPush.push(user.userName)
                                    }
                                }
                            }
                            userConversationToRet.push(toPush)
                        }
                        // console.log({messages: messages, usernames: userConversationToRet})
                        return res.send({messages: messages, usernames: userConversationToRet, conversationIds:conversationIds, lastMessageTime: conversationTimes})
                    })
                    
                })
                
            })
        })
    }) 
}


