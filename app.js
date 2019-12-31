var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var validation = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');

//mongodb
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to Mongodb');
});

var app = express();

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

//Express massages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator
app.use(validation({
	customValidators: {
		isImage: function(value, filename){
			var extension = (path.extname(filename)).toLowerCase();
			switch (extension){
				case '.jpg':
					return '.jpg';
				case '.jpeg':
					return '.jpeg';
				case '.png':
					return '.png';
				case '':
					return '.jpg';
				default:
					return false;
			}
		}
	}
}));

//Express FileUpload
app.use(fileUpload());

app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//set global error variabel
app.locals.errors = null;

// require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.cart = req.session.cart;
	res.locals.user = req.user || null;
	var cart = req.session.cart;
	var qty = 0;
	if (typeof cart == "undefined") {
		qty = 0;
	}else{
		for(var i = 0; i < cart.length; i++){
			qty = qty + cart[i].qty;
		}
	}

	res.locals.qtyheader = qty;
	next();
});

var Page = require('./models/pages');
var Category = require('./models/categories');
var pages = require('./routes/pages.js');
var cart = require('./routes/cart.js');
var users = require('./routes/user');
var productuser = require('./routes/product.js');
var pagesadmin = require('./routes/admin_pages.js');
var catadmin = require('./routes/admin_categories.js');
var productadmin = require('./routes/admin_product.js');
var banneradmin = require('./routes/admin_banner.js');






app.use('/', pages);
app.use('/admin/pages', pagesadmin);
app.use('/admin/categories', catadmin);
app.use('/admin/banner', banneradmin);
app.use('/admin/product', productadmin);


app.use('/products', productuser);
app.use('/cart', cart);
app.use('/user', users);
//Get all pages to header.ejs
Page.find({}).sort({sorting:1}).exec(function(err,pages){
	if(err){
		console.log(err);
	}else{
		app.locals.pages = pages;
	}
});

//Get all categories
Category.find(function(err, categories){
	if(err){
		console.log(err);
	}else{
		app.locals.categories = categories;
	}
});

var port = 3000;
app.listen(port, function(){
	console.log('Server berjalan dengan port' + port);
});