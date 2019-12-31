var express = require('express');
var router = express.Router();
var Categories = require('../models/categories');

router.get('/', function(req, res){
	Categories.find(function(err, categories){
		res.render('admin/categories',{
			categories : categories
		});
	});
});

router.get('/add-categories', function(req,res){
	var title = "";

	res.render('admin/add_categories',{
		title : title
	});
});

router.post('/add-categories', function(req, res){

	req.checkBody('title', 'Title harus diisi!!').notEmpty();

	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();

	var errors = req.validationErrors();

	if(errors){
		res.render('admin/add_categories',{
			errors:errors,
			title:title
		});
	}else{
		Categories.findOne({link:link}, function(err, categories) {
			if(categories){
				req.flash('danger', 'Categories ini telah ada, silahkan gunakan nama lain');
				res.render('admin/add_categories', {
					title : title
				});
			} else{
				var categories = new Categories({
					title : title,
					link : link
				});

				categories.save(function(err){
					if (err) {
						return console.log(err);
					};
					Categories.find(function(err,categoriess){
						if (err) {
							console.log(err);
						}else{
							req.app.locals.categories = categoriess;
						}
					});

					req.flash('success', 'Page Berhasil Ditambahkan');
					res.redirect('/admin/categories');
				});
			};
		});
	};
});

router.get('/edit-categories/:id', function(req, res){

	Categories.findById(req.params.id, function(err,categories){
		if (err) {
			return console.log(err);
		}
		res.render('admin/edit_categories',{
			title : categories.title,
			id: categories._id
		});
	});
});

router.post('/edit-categories', function(req, res){

	req.checkBody('title', 'Title harus diisi!!').notEmpty();

	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
	var id = req.body.id;

	var errors = req.validationErrors();

	if(errors){
		res.render('/admin/edit_categories',{
			errors:errors,
			title:title,
			id:id
		});
	}else{
		Categories.findOne({link:link, _id: {'$ne': id}}, function(err, categories) {
			if(categories){
				req.flash('danger', 'Categories ini telah ada, silahkan gunakan nama lain');
				res.render('admin/edit_categories', {
					title : title,
					id:id
				});
			} else{
				Categories.findById(id, function(err, categories){
					if (err) {
						return console.log(err);
					};

					categories.title = title;
					categories.link = link;
					categories.save(function(err){
						if (err) {
							return console.log(err);
						};
						Categories.find(function(err,categoriess){
							if (err) {
								console.log(err);
							}else{
								req.app.locals.categories = categoriess;
							}
						});

						req.flash('success', 'Categories Berhasil Diubah');
						res.redirect('/admin/categories/edit-categories/' + id);
					});
				});
			};
		});
	};
});

router.get('/delete-categories/:id', function(req,res){
	Categories.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			return console.log(err);
		}

		Categories.find(function(err, categories){
			if (err) {
				return console.log(err);		
			}else{
				req.app.locals.categories = categories;
			}
		});

		req.flash('success', 'Categories Berhasil Dihapus');
		res.redirect('/admin/categories/');
	});
});

module.exports = router;