var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
//var Friendships = require("../models/Friendships");

module.exports = friendshipTransaction

function friendshipTransaction(data) {
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
    this.status = data.status;
}

friendshipTransaction.prototype.save =  function() {
    var transaction = new Models.Friendship({ //You're entering a new transaction here
        user_1: this.user_1,
        user_2: this.user_2,
        status: this.status
    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            console.error(error.stack || error.message);
            return;
        }
    });
}