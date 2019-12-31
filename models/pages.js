var mongoose = require('mongoose');

var PageSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String
	},
	content: {
		type: String,
		required: true
	},
	sorting: {
		type: Number
	}
});

var Pages = module.exports = mongoose.model('Pages', PageSchema); 