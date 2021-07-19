const mongoose = require("mongoose");

const ItemSchema = require('./Item');
const UserSchema = require('./User');

module.exports = {
    User: mongoose.model('user', UserSchema),
    Item: mongoose.model('item', ItemSchema)
}