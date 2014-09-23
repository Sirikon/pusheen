'use strict';

var apn 	= require('apn');
var gcm 	= require('node-gcm');
var S 		= require('string');

var mongoose = null;
var Schema = null;
var Device = null;

var validateMessage = function(message){
	if(!message.title){
		return false;
	}
	if(!message.message){
		return false;
	}

	return true;
}

var init = function(_mongoose){
	mongoose = _mongoose;
	Schema = mongoose.Schema;

	var DeviceSchema = new Schema({
		token: {type: String, unique: true, index: true, required: true}
	},{strict:false});

	DeviceSchema.statics.getTokensByFilter = function(filter, callback){
		Device.getDevicesByFilter(filter, function(err,docs){
			var tokenList = [];
			for(var i in docs){
				tokenList.push(docs[i].token);
			}
			callback(err,tokenList);
		});
	}

	DeviceSchema.statics.getDevicesByFilter = function(filter, callback){
		Device.find(filter, function(err,docs){
			callback(err,docs);
		});
	}

	var Device = mongoose.model('Device', DeviceSchema);
	module.exports.Device = Device;
}

var send = function(message,filter){
	
}

module.exports = {
	init: init,
	Device: Device,
	send: send
}