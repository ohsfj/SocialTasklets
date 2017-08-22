var log = require('./../replication/log');
var broker_log = require('./../replication/broker_log');
var Brokers = require('../classes/Broker');

var constants = require('../constants');

//collect the deleted/updated/created friendship and device transactions into an update log

function CollectUpdates(data) {
    var logData = data;
    var update;
    Brokers.findByUser({ username: logData.username }, function (e, data) {
        if (e) return next(e);
        switch (logData.key) {
            case constants.Device:    //keeping track of added device transactions
                update = '{ "broker": "' + data.broker + '", "type": "Device", "username": "' + logData.username + '", "device": "' + logData.device + '", "key": "New", "status": "' + logData.status + '", "price": ' + logData.price + '}';

                log.add(JSON.parse(JSON.stringify(update)));
                break;

            case 'd_device':   //keeping track of deleted device transactions
                update = '{ "broker": "' + data.broker + '", "type": "Device", "device": "' + logData.device + '", "key": "Deleted" }';
                log.add(JSON.parse(JSON.stringify(update)));
                break;

            case constants.Friendship: //keeping track of added/updated friendship transactions
                var broker_1 = data.broker;
                Brokers.findByUser({ username: logData.user_2}, function (e, data1) {
                    if (e) return next(e);
                        update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + data1.broker + '", "type": "Friendship", "ID": "' + logData.id + '", "user_1": "' + logData.username + '", "user_2": "' + logData.user_2 + '", "key": "New" }';
                        log.add(JSON.parse(JSON.stringify(update)));
                })
                break;
            case 'd_friendship':   //keeping track of deleted friendship transactions
                var broker_1 = data.broker;
                       Brokers.findByUser({ username: logData.user_2}, function (e, data1) {
                    if (e) return next(e);
                        update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + data1.broker + '", "type": "Friendship", "ID": "' + logData.id + '", "key": "Deleted" }';
                        log.add(JSON.stringify(update));
                    })
                break;
            default:
                ;
        }
    });
}

//triggering the global update every 24 hours
setTimeout(function () {
         globalUpdate( function (e, data) {
                         });
     }, 1000*60*60*24); // timeout in 24 hours

   //Sending updates to all brokers. Triggered once per day
   function globalUpdate(callback) {

   //find all connected brokers
   Brokers.findBrokers( function (e, data) {
   if (e) callback(e, null);
   var broker_list = data;
   //collect updates for each broker
   broker_list.forEach(function (broker, index, array) {
   var updates = updateBroker(broker);

   //send updates to brokers via sockets
   //sockets.send_global_updates(broker, updates);    ***********needs to be changed the structure of the socket file
   });
   //empty the log data when updates are sent to all brokers
   log.restart();
   //set the broker_log to empty so the brokers restart from version 0
   broker_log. restart();
   setTimeout(globalUpdate, 1000*60*60*24);   // timeout in 24 hours
   });
 }

//retrieve updates related to a specific broker
function updateBroker(broker) {
    var log_updates = log.read();
    var broker_updates = [];

    var broker_version = readBroker(broker);
    var log_length = log_updates.length;  //the length after the last committed change
    var i = log_length;

    while (i > broker_version) {
        var temp_element = JSON.parse(log_updates[i-1]);
        if (temp_element.type == 'Friendship') {
            if (temp_element.broker_1 == broker || temp_element.broker_2 == broker) {
                broker_updates = broker_updates.concat(JSON.stringify(temp_element));
            }
        }
        else {
            if (temp_element.broker == broker) {
                broker_updates = broker_updates.concat(JSON.stringify(temp_element));
            }
        }
        i--;
    }
    syncBroker(broker, log_length); //broker's version is equal to the array index of the last update in the log
    return broker_updates;
}

//update the sync version of the broker
function syncBroker(broker, version) {
    console.log(" Broker's new version: " + version );
    var elem = { broker:  broker, version: version };
    broker_log.add(elem);
}

//get the last updated version of the broker
function readBroker(broker) {
    var current_version = broker_log.read_one(broker);
    console.log(" Broker's old version: " + current_version );
    return current_version;
}

module.exports = {

    CollectUpdates: function (data, id, key) {
        return CollectUpdates(data, id, key);
    },
    updateBroker: function (broker) {
        return updateBroker(broker);
    },
    syncBroker: function (broker, version) {
        return syncBroker(broker, version);
    },
    readBroker: function (broker) {
        return readBroker(broker);
    },
    globalUpdate: function (broker) {
            return globalUpdate(broker);
        }
};
