const db = require('../models/index')
const ROLES = db.Roles
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {

    // look in our user database and see if user exist
    //check for username
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if(err) {
            res.status(500).send({message: err})
            return
        }
        
        if (user) {
            console.log(user)
            res.status(400).send({message: "failed, This user already exist, findone"})
        }

    // Email
    User.findOne({
        email: req.body.email
      }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (user) {
          res.status(400).send({ message: "Failed! Email is already in use!" });
          return;
        }
  
            next();
        });
        });
    };
  
    checkRolesExisted = (req, res, next) => {
        if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });

                return;
                }
            }
        }
    
        next();
    };

    checkPasswordsMatch = (req, res,next) => {
        if (req.body.password !== req.body.passwordReenter){
            return res.send({message: "Password's don't match"})
        }        
        next();
    }
  
  const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
    checkPasswordsMatch
  };

  
  module.exports = verifySignUp;