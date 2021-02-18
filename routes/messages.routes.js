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
    // routes
    app.post("/api/message/new", controller.createConversationWithNewMessage)
    app.post("/api/message", controller.sendMessageToExistingGroup)
    app.get("/api/message", controller.getConversation)
    app.get("/api/conversations/:userName", controller.getUserConversations)
}
