(function() {
	var getNode = function(s) {
		return document.querySelector(s);
	},
	status = getNode('.chat-status span'),
	messages = getNode('.chat-messages'),
	textarea = getNode('.chat-textarea'),
	chatName  = getNode('.chat-name'),
	statusDefault = status.textContent,
	setStatus = function(s) {
		status.textContent = s;

		if(s !== statusDefault) {
			var delay = setTimeout(function() {
				setStatus(statusDefault);
				clearInterval(delay);
			}, 2000);
		}
	};
	console.log(statusDefault);
	try {
		var socket = io.connect('http://127.0.0.1:8080');
	} catch(e) {
		// Set status to warn user
	}

	if(socket !== undefined) {

		// Listen for output
		socket.on('output', function(data) {
			if(data.length) {
				// Loop through results
				for(var i = 0; i < data.length; i++) {
					var message = document.createElement('div');
					message.setAttribute('class', 'chat-message');
					message.textContent = data[i].name + ": " + data[i].message;
					// Append
					messages.appendChild(message);
				}
			}
		});
		// Listen for status
		socket.on('status', function(data) {
			setStatus((typeof data === 'object') ? data.message : data);

			if(data.clear === true) {
				textarea.value = '';
			}
		});
		// Listen for keydown
		textarea.addEventListener('keydown', function(event) {
			var self = this;
			var name = chatName.value;
			
			if(event.which === 13 && event.shiftKey === false) {
				socket.emit('input', {
					name: name,
					message: self.value
				});

				event.preventDefault();	
			}
		});
	}
})();