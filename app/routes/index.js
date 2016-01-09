'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var bodyparser = require("body-parser");
var url = 'mongodb://localhost:27017/clementinejs';



module.exports = function (app, passport) {
	var mongoose = require("mongoose");
	
	mongoose.connect(process.env.MONGO_URI);
	
	var userSchema = mongoose.Schema({
		name: String,
		email: String,
		password: String
	});

	var User1 = mongoose.model("User1",userSchema);

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			console.log("user not logged in");
			res.redirect('/signup');
		}
	}
	
	function usernameAlreadyExists(req,res,next){
		User1.find({name:req.body.name},function(err,users){
			if(err) throw err;
			if(users.length>0){
				req.body.name="alreadyExists";
			}
			next();
		});
	}
	
	function emailAlreadyExists(req,res,next){
		User1.find({email:req.body.email},function(err,users){
			if(err) throw err;
			if(users.length>0){
				req.body.email="alreadyExists";
			}
			next();
		});
	}
	
	function validateLoginCredentials(req,res,next){
		User1.find({email:req.body.email},function(err,users){
			if(err) throw err;
			if(users.length>0){
				if(users[0].password===req.body.password){
					req.body.email="valid";
					req.body.password="valid";
				}
			}
			next();
		});
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index1.html');
		});
		
	app.use('/signup',bodyparser.json());
	app.use('/signup',usernameAlreadyExists);
	app.use('/signup',emailAlreadyExists);
	app.route('/signup')
		.get(function(req,res){
			User1.find({},function(err,users){
				if(err) throw err;
				//console.log(users);
			})
			res.sendFile(path+'/public/signup.html');	
		})
		.post(function(req,res){
			if(req.body.name==="alreadyExists"){
				console.log("user not saved because the username already exists!");
			}else if(req.body.email==="alreadyExists"){
				console.log("user not saved because the email already exists");
			}else{
				var userObject = new User1(req.body);
				userObject.save(function(err){
					if(err) throw err;
					console.log("entry logged successfully! "+userObject);
				});
			}
			res.send(req.body);
		});
		
	app.use('/login',bodyparser.json());
	app.use('/login',validateLoginCredentials);
	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		})
		.post(function(req,res){
			res.send("");
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
