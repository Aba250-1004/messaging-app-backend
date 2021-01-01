const { verifySignup } = require('../middlewares/')
const controller = require('../controllers/auth.controller')
const db = require('../models/index')
// Access to our db through User and Role varible
const User = db.user

module.exports = function(app) {
    app.use( (req,res, next) => {
        // set header and allow use of x access token ( we will use this to pass our token )
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-type, Accept"
        );
        next();
    })
    // set up signup route and pass middlewares to check username,email and roles
    app.post("/api/auth/signup", 
    [verifySignup.checkDuplicateUsernameOrEmail, verifySignup.checkRolesExisted],
    controller.signup
    )
    // handle sign
    app.post("/api/auth/signin", controller.signin)

    // delete user
    app.delete("/api/auth/delete", controller.delete)

    // change user email
    app.put("/api/auth/editEmail", controller.editEmail)

    // edit username
    app.put("/api/auth/editUsername", controller.editUsername)

    // edit password
    app.put("/api/auth/editPassword", controller.editPassword)
}

