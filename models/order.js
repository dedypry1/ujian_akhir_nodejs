var mongoose = require('mongoose');

var OrderSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	nama_penerima: {
		type: String,
		required: true
	},
	email: {
		type: String
	},
	notelepon: {
		type: Number,
		required: true
	},
	alamat: {
		type: String,
		required: true
	},
	tanggal: {
		type: Date,
		required: true
	},total: {
		type: Number,
		required: true
	}
});

var Order = module.exports = mongoose.model('Order', OrderSchema); 