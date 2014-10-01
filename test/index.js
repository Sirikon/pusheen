var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var pusheen = require('../pusheen.js');
var fs = require('fs');

mongoose.connect('mongodb://localhost/testpusheen');
pusheen.init(mongoose);

var app = new express();

app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({limit:'5mb', extended: true}));

app.use('/static', express.static(__dirname + '/public'));

app.get('/devices', function(req,res){
	pusheen.Device.find(function(err,docs){
		res.send(docs);
	});
});

app.post('/devices', pusheen.RegisterController);

app.get('/removedevices', function(req,res){
	pusheen.Device.find(function(err,docs){
		for(var i in docs){
			docs[i].remove();
		}
	})
	res.send('ok');
})

app.post('/send', function(req,res){
	pusheen.config({
		gcmKey: fs.readFileSync(process.cwd() + '/test/gcmKey.txt'),
		apnProd: false,
		apnCert: process.cwd() + '/test/cert.pem',
		apnKey: process.cwd() + '/test/cert.pem'
	});
	if(req.body.device == '*'){
		filter = {};
	}else{
		filter = req.body.device;
	}
	pusheen.send({
		title:req.body.title,
		message:req.body.message
	},filter);
	res.send('ok');
});

app.listen(3000);

console.log("Listening web server on port 3000");