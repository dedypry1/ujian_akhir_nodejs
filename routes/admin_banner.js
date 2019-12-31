var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Banner = require('../models/banner');
var Categories = require('../models/categories');

router.get('/', function(req, res){
	var count;

	Banner.count(function(err, c){
		count = c;
	});

	Banner.find(function(err, banner){
		res.render('admin/banner',{
			banner : banner,
			count : count
		});
	});
});

router.get('/add-banner', function(req, res){
	var title = "";
	var desc = "";
	var price = "";

	Categories.find(function(err, categoriess){
		res.render('admin/add_banner',{
			title : title,
			desc : desc,
			categories : categoriess,
			price : price
		});
	});
});

router.post('/add-banner', function(req, res){
	if (req.body.noimage == "") {
		var imageFile = "";
	}else{
		var imageFile = req.files.image.name;
	}
	//var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

	req.checkBody('title', 'Title harus diisi!!').notEmpty();
	req.checkBody('desc', 'Description harus diisi!!').notEmpty();
	req.checkBody('price', 'Price harus diisi!!').isDecimal();
	req.checkBody('image', 'Kamu harus mengupload gambar').isImage(imageFile);

	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
	var desc = req.body.desc;
	var price = req.body.price;
	var categories = req.body.categories;

	var errors = req.validationErrors();

	if(errors){
		Categories.find(function(err, categoriess){
			res.render('admin/add_banner',{
				errors:errors,
				title : title,
				desc : desc,
				categories : categoriess,
				price : price
			});
		});
	}else{
		Banner.findOne({link:link}, function(err, banner) {
			if(banner){
				req.flash('danger', 'banner ini telah ada, silahkan gunakan nama lain');
				Categories.find(function(err, categoriess){
					res.render('admin/add_banner',{
						title : title,
						desc : desc,
						categories : categoriess,
						price : price
					});
				});
			} else{
				var banner = new Banner({
					title : title,
					link : link,
					desc : desc,
					price : price,
					categories : categories,
					image : imageFile
				});

				banner.save(function(err){
					if (err) {
						return console.log(err);
					};

					mkdirp('public/banner_images/' + banner._id, function (err){
						return console.log(err);	
					});

					if(imageFile != ""){
						var bannerImage = req.files.image;
						var path = 'public/banner_images/' + banner._id + '/' + imageFile;

						bannerImage.mv(path, function(err){
							return console.log(err);	
						});
					}

					req.flash('success', 'banner Berhasil Ditambahkan');
					res.redirect('/admin/banner');
				});
			};
		});
	};
});

router.get('/edit-banner/:id', function(req, res){

	Categories.find(function(err, categories){
		Banner.findById(req.params.id, function(err,banner){
			if (err) {
				return console.log(err);
				res.redirect('/admin/banner');
			}else{
				res.render('admin/edit_banner',{
					title : banner.title,
					desc : banner.desc,
					categories : categories,
					category : banner.categories,
					price : banner.price,
					image : banner.image,
					id: banner._id
				});
			};
		});
	});
});

router.post('/edit-banner/', function(req, res){
	if (req.body.noimage == "") {
		var imageFile = "";
	}else{
		var imageFile = req.files.image.name;
	}
	//var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

	req.checkBody('title', 'Title harus diisi!!').notEmpty();
	req.checkBody('desc', 'Description harus diisi!!').notEmpty();
	req.checkBody('price', 'Price harus diisi!!').isDecimal();
	req.checkBody('image', 'Kamu harus mengupload gambar').isImage(imageFile);

	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
	var desc = req.body.desc;
	var price = req.body.price;
	var categories = req.body.categories;
	var piimage = req.body.piimage;
	var id = req.body.id;

	var errors = req.validationErrors();

	if(errors){
			res.redirect('/admin/banner/edit-banner/' +id);
	}else{
		Banner.findOne({link:link, _id: {'$ne':id}}, function(err, banner) {
			if (err) {
				console.log(err);
			}
			if(banner){
				req.flash('danger', 'banner ini telah ada, silahkan gunakan nama lain');
				res.redirect('/admin/banner/edit-banner/' +id);
			} else{
				Banner.findById(id, function(err, p){
					if (err) {
						console.log(err);
					}

					p.title = title;
					p.link = link;
					p.desc = desc;
					p.price = price;
					p.categories = categories;
					if(imageFile != ""){
						p.image = imageFile;
					}else{
						p.image = piimage;
					}

					p.save(function(err){
						if (err) {
							console.log(err);
						};

						if(imageFile != ""){
							if(piimage !=""){
								fs.remove('public/banner_images/' + id + '/' + piimage, function(err){
									if (err) {
										console.log(err);
									}
								});
							}

							var bannerImage = req.files.image;
							var path = 'public/banner_images/' + id + '/' + imageFile;

							bannerImage.mv(path, function(err){
								return console.log(err);
							});
						};
						req.flash('success', 'banner Berhasil Diubah');
						res.redirect('/admin/banner/edit-banner/' + id);
					});
				})
			};
		});
	};
});

router.get('/delete-banner/:id', function(req,res){

	var id = req.params.id;
	var path = 'public/banner_images/' + id;

	fs.remove(path, function(err){
		if (err) {
			return console.log(err);
		} else {
			Banner.findByIdAndRemove(id, function(err){
				if (err) {
					console.log(err);
				}
			});

			req.flash('success', 'Banner Berhasil Dihapus');
			res.redirect('/admin/banner');
		}
	});
});

module.exports = router;