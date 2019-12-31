var mongoose = require('mongoose');

var CategoriesSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String
	}
});

var Categories = module.exports = mongoose.model('Categories', CategoriesSchema); 
