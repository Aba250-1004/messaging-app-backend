const db = require('../models/index')
const ROLES = db.Roles
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    if (req.body.password !== req.body.passwordReenter){
        return res.send({message: "Password's don't match"})
    }  
    // look in our user database and see if user exist
    //check for username
    User.findOne({
        userName: req.body.userName
    }).exec((err, user) => {
        if(err) {
            return res.status(500).send({message: err})
        }
        
        if (user) {
            return res.status(400).send({message: "failed, This user already exist"})
        }

    // Email
    User.findOne({
        email: req.body.email
      }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
          
        }

        if (user) {
            return res.status(400).send({ message: "Failed! Email is already in use!" });
        }
        next();
            
        });
        
        });
    };
  
    checkRolesExisted = (req, res, next) => {
        if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                return res.status(400).send({
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });

                }
            }
        }
    
        next();
    };
  
  const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
  };

  
  module.exports = verifySignUp;