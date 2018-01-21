var express = require('express');
var router = express.Router();
var User = require('../shema/user').Person;
var Pic = require('../shema/user').Pic;
var Blog = require('../shema/user').Blog;
var e = require('../ext/error');

const config = require('../config.json');
const formidable = require('formidable');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose')

/* GET home page. */

router.get('/', function(req, res, next) {
  if (req.session.user){
    User.findById(req.session.user,function(err,user){
      if (err) next(err);
      res.render('index', { title: 'Express', name: user.name });
    })
  } else {
    res.render('index', { title: 'Express' , name: 'Гость' });
  }
});

router.get('/myaccount', function(req, res, next) {
  if (req.session.user){
		User.findById(req.session.user,function(err,user){
			if (err) next(err);
			res.status(302);
			res.setHeader('Location','/user/'+encodeURI(user.name));
			res.end();
		})
	} else {
		res.render('index', { title: 'Express' , name: 'Гость' });
	}
});

router.get('/user/:id', function(req, res, next) {
	User.findOne({name: req.param('id')},function(err,user){
	if (err) console.log(err);
	if (user){

		var obj = {
			title: user.name,
			display: 'none'
		};

		if (req.session.user == user._id){
			req.session.own = true;
			obj.display = 'block';
		} else {
			req.session.own = false;
		}
		var idd = user._id;

		Pic.findOne({owner: idd},function(err,pic){
			if (pic){
				Object.assign(obj, {path: pic.picture});
			}
			}).then(function(){
				Blog.find({owner: idd}).then(item => {
				Object.assign(obj, {items: item});
			}).then(function(){
				res.render('user', obj);
			})
		})

	} else {
		res.end();
	}
	})
});

router.get('/blog', function (req, res) {
    //получаем список записей в блоге из базы
  Model
    .find()
    .then(items => {
      // обрабатываем шаблон и отправляем его в браузер передаем в шаблон список
      // записей в блоге
      Object.assign(obj, {items: items});
      res.render('pages/blog', obj);
    });
});

router.get('/exit', function(req, res, next) {
	if (req.session.user){
		User.findById(req.session.user,function(err,user){
			req.session.destroy();
			res.status(302);
			res.setHeader('Location','/');
			res.end();
		})
	} else {
		res.render('index', { title: 'Express' , name: 'Гость' });
	}
});

router.get('/users',function(req,res,next){
	User.find({},function(err,users){
		if (err) next(err);
		res.json(users)
	})
})

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/register', function(req, res, next) {

	var nick = req.body.name;
	var pass = req.body.password;

	User.create({name: nick, password: pass},function(err,user){
		if (err) next(err)
		res.render('register', { title: 'Express', result: 'Вы успешно зарегистрировались!' });
	})

});

router.post('/login', function(req, res, next) {

	var nick = req.body.name;
	var pass = req.body.password;

	User.findOne({name: nick},function(err,user){
		if (err) next(err);
		if (user){
			if (user.checkPassword(pass)){
				req.session.user = user._id;
				console.log(req.session.user);
				res.status(302);
				res.setHeader('Location','/user/'+encodeURI(user.name));
				res.end();
			} else {
				next(e.setError(401));
			}
		} else {
			next(e.setError(401));
		}
	})
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post('/upload', function (req, res) {

  if (req.session.own){

  	var namedir;
  	var currpath;

  	User.findById(req.session.user,function(err,user){

  		if (err) console.log(err)
  		console.log('user read')
  		namedir = user.name+'';

  		currpath = path.join(config.upload,namedir);

  		if (fs.existsSync(currpath)) {
			fs.readdir(currpath, (err, files) => {
				if (err) throw err;

			for (const file of files) {
				fs.unlink(path.join(currpath, file), err => {
			if (err) throw err;
			});
			}
			});
		}


		Pic.remove({owner: req.session.user},function(err,pic){
			if (err) console.log(err);
		})

  		fs.mkdirs(currpath, function(err) {

			console.log(err);

			let form = new formidable.IncomingForm();
			form.uploadDir = path.join(process.cwd(), currpath);

			form.parse(req, function(err, fields, files) {

			if (err) {
			  return res.json({status: 'Не удалось загрузить картинку'});
			}

			if (!fields.name) {
			  fs.unlink(files.photo.path);
			  return res.json({status: 'Не указано описание картинки!'});
			}

			fs.rename(files.photo.path, path.join(config.upload,namedir,files.photo.name), function (err) {
			if (err) {
				fs.unlink(path.join(config.upload, files.photo.name));
				fs.rename(files.photo.path, files.photo.name);
			}
			// console.log(path.join(config.upload,namedir,files.photo.name))
			let dir = config
			.upload
			.substr(config.upload.indexOf('/'));
			const item = new Pic({name: fields.name, owner: user._id, picture: path.join(dir,namedir,files.photo.name)});
			item
			.save()
			.then(
				i => {
					res.status(302);
					res.setHeader('Location','/user/'+encodeURI(user.name));
					res.end();
				},
				e => res.json({status: e.message})
			);
			// const item = new Model({name: fields.name});
			// item
			//   .save()
			//   .then(pic => {
			//     Model.update({ _id: pic._id }, { $set: { picture: path.join(dir, files.photo.name)}}).then(
			//       i => res.json({status: 'Картинка успешно загружена'}),
			//       e => res.json({status: e.message})
			//       );
			//   });
			});

			});
		})

  	});
  }
});

router.post('/addpost', (req, res) => {

	if (req.session.own){

		if (!req.body.title || !req.body.date || !req.body.text) {
		    return res.json({status: 'Укажите данные!'});
		}

		var posts = 0;

		Blog.find({owner: req.session.user},function(err,blog){

			posts = blog.length;

			if (posts>4) {

				Blog.remove({_id: blog[0]._id},function(err,blog){
				})

			}

			var item = new Blog({title: req.body.title,owner: req.session.user,date: new Date(req.body.date), body: req.body.text});
			item.save().then(
		    (i) => {
		    	User.findById(req.session.user,function(err,user){
		    		res.status(302);
					res.setHeader('Location','/user/'+encodeURI(user.name));
					res.end();
				})
		      // res.json({status: 'Запись успешно добавлена'});
		    }, e => {
		      //если есть ошибки, то получаем их список и так же передаем в шаблон
		    const error = Object
		        .keys(e.errors)
		        .map(key => e.errors[key].message)
		        .join(', ');

		      //обрабатываем шаблон и отправляем его в браузер
		    res.json({
		      status: 'При добавление записи произошла ошибка: ' + error
		    });
		  })

		})


		}

});

module.exports = router;
