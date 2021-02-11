const controller = require('../controllers/messages.controller')

module.exports = function(app) {
    app.use( (req,res, next) => {
        // set header and allow use of x access token ( we will use this to pass our token )
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-type, Accept, x-requested-with"
        );
        next();
    })
    // set up signup route and pass middlewares to check username,email and roles

}