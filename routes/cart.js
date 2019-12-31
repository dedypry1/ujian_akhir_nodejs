var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Order = require('../models/order');
var OrderDetail = require('../models/orderdetail'); 



router.get('/add/:product', function(req, res){
	var link = req.params.product;

	Product.findOne({link: link}, function(err, product){
		if(err){
			console.log(err);
		}

		if (typeof req.session.cart == "undefined") {
			req.session.cart = [];
			req.session.cart.push({
				title: link,
				qty: 1,
				price: product.price,
				image: '/product_images/' + product._id + '/' + product.image
			});
		}else{
			var cart = req.session.cart;
			var newItem = true;

			for (var i = 0; i < cart.length; i++) {
				if (cart[i].title == link) {
					cart[i].qty++;
					newItem = false;
					break;
				}
			}

			if(newItem){
				cart.push({
					title: link,
					qty: 1,
					price: product.price,
					image: '/product_images/' + product._id + '/' + product.image
				});
			}
		}

		req.flash('success', 'Product Berhasil Ditambahkan');
		res.redirect('back');
	});
});

router.get('/shopping-cart', function(req, res){

	if(req.session.cart && req.session.cart.length == 0){
		delete req.session.cart;
		res.redirect('/cart/shopping_cart');
	}else{
		res.render('shopping_cart',{
			title: 'Shopping Cart',
			cart: req.session.cart
		});	
	}
});

router.get('/update/:product', function(req, res){

	var link = req.params.product;
	var cart = req.session.cart;
	var action = req.query.action;

	for (var i = 0; i < cart.length; i++) {
		if (cart[i].title == link) {
			switch(action){
				case "add":
					cart[i].qty++;
					break;
				case "remove":
					cart[i].qty--;
					if(cart[i].qty < 1){
						cart.splice(i, 1);
					}
					break;
				case "clear":
					cart.splice(i, 1);
					if (cart.length == 0) {
						delete req.session.cart;
					}
					break;
				default:
					console.log('Perubahan data gagal');
					break;
			}
			break;
		}
	}

	req.flash('success', 'Cart Berhasil Diubah');
	res.redirect('/cart/shopping-cart');
});

router.get('/clear', function(req,res){

	delete req.session.cart;

	req.flash('success','Cart telah terhapus');
	res.redirect('/cart/shopping-cart');
});

router.get('/checkout', function(req,res){
	res.render('checkout',{
		title: 'Checkout',
		cart: req.session.cart
	});
});

router.post('/save', function(req, res){

	var username = req.body.username;
	var name = req.body.name;
	var email = req.body.email;
	var notelp = req.body.notelp;
	var alamat = req.body.alamat;
	var total = req.body.total;
	let newDate = new Date();
	var cart = req.session.cart;

	req.checkBody('name', 'Nama tidak boleh kosong!').notEmpty();
	req.checkBody('email', 'Email tidak boleh kosong!').isEmail();
	req.checkBody('notelp', 'Nomor Telepon tidak boleh kosong!').notEmpty();
	req.checkBody('alamat', 'Alamat tidak boleh kosong!').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('checkout',{
			title: 'Checkout',
			cart: cart
		});
	}else{
		var order = new Order({
			username: username,
			nama_penerima: name,
			email: email,
			notelepon: notelp,
			alamat: alamat,
			tanggal: newDate,
			total: total
		});

		order.save(function(err){
			if (err) {
				console.log(err);
			}else{
				Order.findOne({username : username}, function(err, orders){
					cart.forEach(function(product){
						var subtotal = product.qty * product.price;
						var orderdetail = new OrderDetail({
							id_order: orders._id,
							product_title: product.title,
							product_qty: product.qty,
							subtotal: subtotal
						});

						orderdetail.save(function(err){
							if(err){
								console.log(err);
							}
						});
					});
				}).sort({tanggal: -1});

				delete req.session.cart;
				req.flash('success', 'Pembelian anda Berhasil disimpan');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;