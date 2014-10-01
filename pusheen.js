'use strict';

var apn 	= require('apn');
var gcm 	= require('node-gcm');
var S 		= require('string');

var mongoose = null;
var Schema = null;
var Device = null;

var Config = {
	gcmKey: '',
	apnProd: '',
	apnCert: new Buffer(0),
	apnKey: new Buffer(0),
};

var config = function(data){
	Config = data;
}

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

	DeviceSchema.statics.getTokensByObject = function(o,callback){
		var tokenList = [];
		if( Array.isArray(o) ){
			if( typeof(o[0]) == 'object' ){
				for(var i in o){
					tokenList.push(o[i].token);
				}
				callback(null,tokenList);
			}else if( typeof(o[0]) == 'string' ){
				tokenList = o;
				callback(null,tokenList);
			}
		}else if( typeof(o) == 'string' ){
			tokenList.push(o);
			callback(null,tokenList);
		}else if( typeof(o) == 'object' ){
			Device.getTokensByFilter(o,function(err,docs){
				callback(err,docs);
			});
		}
	}

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

var sendGCM = function(message,tokens){
	var sender = new gcm.Sender(Config.gcmKey);

	message.title = S(message.title).stripTags().s.trim();
	message.message = S(message.message).stripTags().s.trim();
	var gcmmsg = new gcm.Message({
		delayWhileIdle: true,
		data: message
	});

	sender.send(gcmmsg, tokens, 2, function (err, result) {
		if(err){ console.error(err); return; }
		console.log(result);
	});
}

var sendAPN = function(message,tokens){
	var apnOptions = {
		cert: Config.apnCert,
		key: Config.apnKey,
		production: Config.apnProd
	}
	var apnConnection = apn.Connection(apnOptions);

	var note = new apn.Notification();

	note.alert = message.title;
	note.sound = "ping.aiff";
	note.payload = message;

	apnConnection.pushNotification(note, tokens);

}

var send = function(message,filterOrList){
	if( !validateMessage(message) ){ return false; }
	module.exports.Device.getTokensByObject(filterOrList, function(err,tokens){
		sendGCM(message,tokens);
		sendAPN(message,tokens);
	});
}

var RegisterController = function(req,res){
	var newDevice = new module.exports.Device(req.body);
	newDevice.save(function(err){
		if(err){ res.send(err); return; }
		res.send('ok');
	});
}

module.exports = {
	init: init,
	Device: Device,
	send: send,
	config: config,
	RegisterController: RegisterController
}