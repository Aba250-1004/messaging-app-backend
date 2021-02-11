const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose
db.user = require('./user.model')
db.role = require('./role.model')
db.conversation = require('./conversation.model')
db.message = require('./message.model')
// db.url = dbConfig.url;

db.Roles = ['users', 'admin']



module.exports = db