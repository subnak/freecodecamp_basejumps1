'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var userPollSchema = mongoose.Schema({
    identifier:String,
    poll:Schema.Types.Mixed,
    alreadyVoted:[String]
});

module.exports = mongoose.model('RegisteredPolls2', userPollSchema);