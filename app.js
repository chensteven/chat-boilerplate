var express = require('express');
var mongoose = require('mongoose');
var client = require('socket.io').listen(8080).sockets;
var app = express();

var dbConfig = require('./config/database.js');

var Message = require('./app/models/message.js');

// Settings
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// Database + Socket
mongoose.connect(dbConfig.url, function(err) {
	if (err) throw err;
	console.log('Successfully connected to Mongodb server at ' + dbConfig.url);

	client.on('connection', function(socket) {
		console.log('One socket is connected');

		// Send error statuses from the server to the client
		sendStatus = function(s) {
			socket.emit('status', s);
		};
		// Emitting all messages upon connection
		Message.find().limit(100).sort({_id: 1}).exec(function(err, res) {
			if(err) throw err;
			socket.emit('output', res);
		});
		// Waiting for user input
		socket.on('input', function(data) {
			// Creating message object
			var message = new Message ({
				name: data.name,
				message: data.message
			});	
			// Check for blank spaces
			var whitespacePattern = /^\s*$/;
			if (whitespacePattern.test(message.name) || whitespacePattern.test(message.message)) {
				console.log('Invalid');
				// Send error statuses
				sendStatus('Name and message is required.');
			}
			else {
				message.save(function(err) {
					if (err) console.log('Error in insertion');
					console.log('Message saved');

					// Emit latest messgage to all clients
					client.emit('output', [data]);
					// Send status when object is saved on the server
				 	sendStatus({
				 		message: 'Message sent',
				 		clear: true
				 	});
				});
			}
		});
	});
});

// Routes
require('./app/routes/route')(app);

var port = 3031;
app.listen(port, function(err) {
	if (err) throw err;
	console.log('Express Server is now listening to ' + port);
})