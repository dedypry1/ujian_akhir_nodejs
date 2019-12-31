var mongoose = require('mongoose');

var BannerSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	image: {
		type: String
	},
});

var Banner = module.exports = mongoose.model('Banner', BannerSchema); 