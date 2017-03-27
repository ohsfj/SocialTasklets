/**
 * Created by alexb on 3/18/2017.
 */
var dbAccess = require('./dbAccess');
var constants = require('../constants');

function findPotentialProvider(consumer, callback) {
    var potentialprovider = '[';
    var consumer = consumer.name;
    var provider;
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, userid: consumer}).exec(function (e, res) {
        res.forEach(function (data, index, array) {
            if (data.user_1 == consumer) {
                provider = data.user_2;
            } else if (data.user_2 == consumer) {
                provider = data.user_1;
            }
            dbAccess.find({type: constants.User, userid: provider}).exec(function (e, res) {
                potentialprovider = potentialprovider.concat('{ \"userid\": \"' + res.userid + '\", \"price\": ' + res.price + '}');
                userProcessed += 1;
                if (userProcessed == array.length) {
                    potentialprovider = potentialprovider.concat(']');
                    potentialprovider = potentialprovider.replace('}{', '},{');
                    callback (potentialprovider);
                }
            });
        })
    });
}


//*****
function findFriends(friend, callback) {
	var F_List = '[';
    var friend = friend.name;
    var Fr_status = 'Requested';
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, userid: consumer, FriendshipStatus: Fr_status}).exec(function (e, res) {
        res.forEach(function (data, index, array) {
            if (data.user_1 == consumer) {
                provider = data.user_2;
          } else if (data.user_2 == consumer) {
                provider = data.user_1;
            }
            dbAccess.find({type: constants.User, userid: provider}).exec(function (e, res) {
                F_List = F_List.concat('{ \"userid\": \"' + res.userid + '}');
                userProcessed += 1;
            if (userProcessed == array.length) {
                F_List = F_List.concat(']');
                F_List = F_List.replace('}{', '},{');
                callback (F_List);
                }   
            });
        })
    });
}
//*****

// *****
//Not sure if it makes sense to change the file constants.js with the new entries
module.exports = {
	find: function (data, callback) {
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        }else if (data.type == constants.Friends) {
            return findFriends(data, callback);
			  }
            }
    };