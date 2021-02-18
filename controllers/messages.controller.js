const config = require('../config/auth.config')
const { conversation } = require('../models/index')
const db = require('../models/index')
// Access to our db through User and Role varible
const Conversation = db.conversation
const Message = db.message
const User = db.user

exports.createConversationWithNewMessage = (req,res) => {
            User.find({
                userName: {$in: [req.body.userName,...req.body.otherUserNames]}
            }).exec((err,users) => {
                console.log("error: "+err)
                console.log("users: "+users)
                if (users.length !== [req.body.userName,...req.body.otherUserNames].length || 0 === req.body.otherUserNames.length ){
                    console.log("didn't allow")
                    return res.send({message: "A user doesn't exist", currentUser:req.body.userName ,listOfUsers:req.body.otherUserNames})
                }else{
                    console.log("allowed")
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

exports.getUserConversations = (req, res) => {
    console.log("hit get user convos")
    console.log("req.body.username: "+req.params.userName)
    User.findOne({
        userName:req.params.userName
    }).exec((err, user) => {
        console.log("user: "+ user)
        Conversation.find({
            userIds:user._id
        }).exec((err, conversation) => {
            let conversationIds = []
            for (let convos of conversation){
                conversationIds.push(convos.messages[convos.messages.length -1])
            }
            Message.find({
                _id:{$in:conversationIds}
            }).sort({
                createdAt: "desc"
            }).exec((err, messages) => {
                //console.log(err)
                Conversation.find({
                    message:messages._id
                }).exec((err, conversation) => {
                    // console.log("conversation matching: "+conversation)
                    let usersInConvo = []
                    for (let convo of conversation){
                        usersInConvo.push(convo.userIds)
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
                        return res.send({messages: messages, usernames: userConversationToRet})
                    })
                    
                })
                
            })
        })
    }) 
}

