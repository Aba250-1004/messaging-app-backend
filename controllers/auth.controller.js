const config = require('../config/auth.config')
const db = require('../models/index')
// Access to our db through User and Role varible
const User = db.user
const Role = db.role

// this will give access to encode and decode the jwt itself. ( allows us to work with jwt)
const jwt = require('jsonwebtoken')
// For hashing / encrypting out passwords 
const bcrypt = require('bcryptjs')
const e = require('cors')

// This will handle stand up
exports.signup = (req,res) => {
        console.log(req)
        // we are going to make out user object using the params returned from req
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        })
        
        // we save that user, and if there is an error we throw that error
        user.save((err, user) => {
            if (err) {
                return res.status(500).send({message: err})
            }

            // if no error we check if roles was passed on req.body
            if( req.body.roles) {
                Role.find({
                    name: { $in: req.body.roles}
                }, (err, roles) => {
                    if (err) {
                        res.status(500).send({message: err})
                        return
                    }
                    
                    // pass roles id from query above to user.roles assigne user and admin
                    user.roles = roles.map( role => role._id)
                    // save our updates users
                    user.save(err =>{
                        if (err) {
                            return res.status(500).send({message: err})
                        }
                        return res.send({message: "User creates successfully"})
                    })

                })    
            } else {
                Role.findOne({name: "user"}, (err, role) => {
                    if (err) {
                        return res.status(500).send({message: err})
                    }
                    // just assign users roles id to document
                    user.roles = [role._id]

                    user.save(err => {
                        console.log(err)
                        if (err) {
                            return res.status(500).send({message: err})
                        }else{ 
                            return res.send({message: "User was registered successfully"})
                        }
                    })
                })
            }
        })
    }

exports.signin = (req, res) => {
    console.log("hit sign in")
    User.findOne({
        userName: req.body.userName
    })
    // populates values form the roles id we stored in the document
    .populate("roles", "-__v")
    // exec retuning our user to user
    .exec((err, user) => {
        if(err) {
            res.status(500).send({message: err})
            return
        }

        // user did not exist
        if(!user) {
            return res.status(404).send({message: "User not found"})
        }

        // validate the password by passing req.body password and the password returned from db
        // over to bcrypt to unhash and compare
        const passwordIsValid = bcrypt.compareSync(
            req.body.password, // unencrypted pw from req.body
            user.password // encrypted pwd saved in db
        ) 

        // if password is not valid, we returning invalid password
        //return a boolean
        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: "Invalid password"})
        }

        // is password is valid we generage a new token
        const token = jwt.sign({id: user._id}, config.secret, {
            expiresIn: 86400// expires token in 24 hours
        })

        // setting roles to pass back in our response
        let authorities = []


        for ( let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
        }
        // seding that response back
        res.status(200).send({
            id: user._id,
            userName: user.userName,
            email: user.email,
            roles: authorities,
            about: user.about,
            accessToken: token
        })

    })
}

exports.getProfile = (req, res) => {
    // console.log("hit get profile")
    // console.log(req.params.id)
    // console.log(req.body.username)
    User.findOne({_id: req.params.id}, function(err,user){
        if (err) {
            return res.status(404).send({message: "User not found"})
        }else{ 
            console.log(user)
            return res.status(202).send({data:user})
        }
    })
    // .exec((err, user) => {
    //     if (err) {
    //         return res.status(404).send({message: "User not found"})
    //     }else{ 
    //         console.log(req.params.id)
    //         return res.status(202).send({data:user})
    //     }
    // })
}



exports.delete = (req,res) => {
    console.log("hit delete account")
    console.log(req.params)
    // will prob fail bc req.params console log req prob body doe
    User.findOneAndDelete({
        userName: req.params.userName
    })
    .exec((err) => {
        if (err) {
            return res.status(404).send({message: "User not found"})
        }else{
            return res.status(202).send({message:"Deleted account :/"})
        }
    })
}

exports.editEmail = (req,res) => {
    User.updateOne({ userName: req.body.userName }, { email: req.body.email })
    .exec((err) => {
        if (err) {
            return res.status(404).send({message: "User not found"})
        }else{
            return res.status(202).send({message:"Email for this account is: " + req.body.email})
        }
    })
}

exports.editAbout = (req,res) => {
    // console.log("hit about")
    // console.log(req.body.username)
    // console.log(req.body.about)
    User.updateOne({ userName: req.body.userName }, { about: req.body.about })
    .exec((err) => {
        if (err) {
            return res.status(404).send({message: "User not found"})
        }else{
            console.log("About for "+ req.body.userName +  " is: " + req.body.about)
            return res.status(202).send({message:"About for"+ req.body.userName +  "is:" + req.body.about})
        }
    })
}

exports.editUsername = (req, res) => {
    // console.log("hit edit username")
    // console.log(req)
    User.updateOne({ userName: req.body.userName }, { userName: req.body.newUserName })
    .exec((err) => {
        if (err) {
            return res.status(404).send({message: "User not found"})
        }else{
            return res.status(202).send({message:"username for this account is now: " + req.body.newUserName})
        }
    })
}

exports.editPassword = (req, res) => {
    // console.log("hit edit password")
    User.findOne({
        userName: req.body.userName
    })
    .exec((err, user) => {
        console.log(err)
        console.log(user)
        if(err) {
            res.status(500).send({message: err})
            return
        }

        // user did not exist
        if(!user) {
            return res.status(404).send({message: "User not found"})
        }

        // validate the password by passing req.body password and the password returned from db
        // over to bcrypt to unhash and compare
        const passwordIsValid = bcrypt.compareSync(
            req.body.password, // unencrypted pw from req.body
            user.password // encrypted pwd saved in db
        )
        console.log(passwordIsValid)
        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: "invalid password"})
        }else{
            console.log(req.body.newPassword === req.body.newPasswordAgain)
            if (req.body.newPassword === req.body.newPasswordAgain){
                User.updateOne({userName:req.body.userName},{password: bcrypt.hashSync(req.body.newPassword, 8)})
               .exec((err) => {
                   console.log(err)
                   if (err){
                       return res.status(404).send({message: "User not found"})
                   }else{
                       return res.status(200).send({message:"New password is: "+ req.body.newPassword})
                   }
               })
            }else{
                return res.status(401).send({ accessToken: null, message: "Passwords don't match"})
            }
        }
    })
}

exports.checkIfUserExists = (req,res) => {
    console.log(req)
    User.findOne({
        userName: req.params.userName
    }).exec((err, user) => {
        console.log(user)
        if (user){
            return res.send({userExists:true})
        }else{
            return res.send({userExists:false})
        }
    })
}