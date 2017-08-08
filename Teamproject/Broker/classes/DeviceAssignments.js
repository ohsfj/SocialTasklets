var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');
var uuidV1 = require('uuid/v1');

// device schema/model
var Devices = require('../models/Devices.js');
var Device = mongoose.model("Device", Devices.deviceSchema); //This creates a Device model.

var replicationManager = require('./../replication/replicationManager');

//Initializing a transaction
function DeviceAssignments(data) {
    this.device = data.device;
    if (!this.device) {
        this.device = uuidV1();
    }
    this.name = data.name,
        this.username = data.username,
        this.price = data.price,
        this.status = data.status
}

DeviceAssignments.prototype.save = function (callback) {
    var tmpDevice = this;
    Device.findOne({'device': this.device}, function (e, udata) {
        if (udata == null) {
            var device = new Device(tmpDevice);
            device.save({}, function (error, data) {
                if (error) {
                    console.error(error);
                }
                if (callback) {
                    callback(null, true);
                }
            });
        }
        else {
            Device.update({'device': tmpDevice.device},
                {name: tmpDevice.name, username: tmpDevice.username, price: tmpDevice.price, status: tmpDevice.status},
                function (error, data) {
                    if (error) {
                        callback(error, false);
                    }
                    else if (callback) {

                        callback(null, true);
                    }
                });
        }
    });
}

function findAll(callback) {
    Device.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByUser(data, callback) {
    Device.find({'username': data.username}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByID(data, callback) {
    var device = data.device;
    Device.find({'device': device}, function (err, obj) {
        if (err) callback(err, null);
        if (callback) callback(null, obj);

    });
}

function deleteByID(data, callback) {
    var device = data.device;
    Device.remove({'device': device}, function (err, obj) {
        if (err) callback(err, null);
        if (callback) callback(null, true);

    });
}

function deleteByUser(data, callback) {
    var username = data.username;
    Device.remove({'username': username}, function (err, obj) {
        if (err) callback(err, null);
        else if (callback) callback(null, true);

    });
}

module.exports = {
    DeviceAssignments: DeviceAssignments,

    get: function (data) {
        return new DeviceAssignments(data);
    },

    findByUser: function (data, callback) {
        return findByUser(data, callback);
    },

    findByID: function (data, callback) {
        return findByID(data, callback);
    },

    findAll: function (callback) {
        return findAll(callback);
    },

    deleteByID: function (data, callback) {
        return deleteByID(data, callback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, callback);
    }

}
