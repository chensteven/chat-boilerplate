var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	name: {
		type: String
	},
	message: {
		type: String
	}
});

module.exports = mongoose.model('Message', messageSchema);