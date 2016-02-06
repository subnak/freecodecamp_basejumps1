/////polls don't seem to be saving here/////



'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var bodyparser = require("body-parser");
var url = 'mongodb://localhost:27017/clementinejs';
var mongoose = require("mongoose");
var User = require('../models/users');
var RegisteredPolls2 = require('../models/userPolls')



module.exports = function (app, passport) {
	app.get('/',function(req,res){
		RegisteredPolls2.find({},function(err,registeredPolls){
			if(err) throw err;
			res.render(path+'/public/index1.ejs',{registeredPolls:registeredPolls});
		})
	});
	app.post('/',logUserInformation,function(req,res){
		console.log("user id? "+JSON.stringify(req.sessionID));
		RegisteredPolls2.findOne({_id:req.body.pollId},function(err,registeredPoll){
			if(err) throw err;
			//also increment the user object
			User.findOne({identifier:registeredPoll.identifier},function(err,user){
				if(err) throw err;

				for(var i=0;i<user.polls.length;i++){
					if(user.polls[i].name===registeredPoll.poll.name){
						for(var j=0;j<Object.keys(user.polls[i].options).length;j++){
							if(Object.keys(user.polls[i].options)[j]===req.body.toBeIncremented){
								user.polls[i].options[Object.keys(user.polls[i].options)[j]]+=1;
								user.markModified('polls');
								user.save();
							}
						}
					}
				}
				
			})
			if(checkIfAlreadyVoted(req.sessionID,registeredPoll)){
				res.send("alreadyVoted");
			}else{
				registeredPoll.poll.options[req.body.toBeIncremented]+=1;
				registeredPoll.alreadyVoted.push(req.sessionID);
				registeredPoll.markModified('poll');
				registeredPoll.save();
				res.send(registeredPoll);
			}
		})
		
	})
	app.put('/',function(req,res){
		console.log("trying to delete everything");
		RegisteredPolls2.find({}).remove().exec();
		User.find({}).remove().exec();
		res.send("all records deleted");
	})
	
////////////////	
	
	app.get("/signup",function(req,res){
		res.render(path+'/public/signup.ejs', { message: req.flash('signupMessage') });
	});
	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
		
///////////////////	
	
	
	
	app.get('/login',function(req,res){
		res.render(path+'/public/login.ejs', {message: req.flash('loginMessage')});
	});	
	app.post('/login',passport.authenticate('local-login',{
		successRedirect:'/profile',
		failureRedirect:'/login',
		failureFlash:true
	}));
	
///////////////////


	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});
//////////////////////


	app.get('/profile',isLoggedIn,logUserPollData,logAllRegisteredPolls,function(req,res){
		res.render(path+"/public/profile.ejs",{
			user:req.user, // get the user out of the session and pass it to the template.
			polls:req.user.polls
		});
	});
	app.post('/profile',function(req,res){
		User.findOne({"identifier":req.user.identifier},function(err,user){
			console.log("trying to save this poll");
			if(err) throw err;
			user.polls.push(req.body);
			user.save();
			
			var newPoll= new RegisteredPolls2();
			newPoll.identifier=req.user.identifier;
			newPoll.poll = req.body;
			newPoll.save();
			res.send("success");
		})
	});
	app.put('/profile',function(req,res){
		RegisteredPolls2.find({"poll.name":req.body.name}).remove().exec();
		User.findOne({"identifier":req.user.identifier},function(err,poll){
			if(err) throw err;
			for(var i=0;i<poll.polls.length;i++){
				if(poll.polls[i].name===req.body.name){
					poll.polls.splice(i,1);
					poll.markModified("poll");
					poll.save();
					res.send(poll);
				}
			}
		})

		
	})
	
/////////////////////


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
};


function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		console.log("user not logged in");
		res.redirect('/signup');
	}
}

function logUserPollData(req,res,next){
	console.log("logged in user: "+JSON.stringify(req.user));
	next();
}

function logAllRegisteredPolls(req,res,next){
	RegisteredPolls2.find({},function(err,polls){
		if(err) throw err;
		console.log("all registered polls: "+polls);
		next();
	});
}

function logUserInformation(req,res,next){
	next();
}

function checkIfAlreadyVoted(sessionID,registeredPoll){
	for(var i=0;i<registeredPoll.alreadyVoted.length;i++){
		if(registeredPoll.alreadyVoted[i]===sessionID){
			// return true;
		}
	}
	return false;
}

function deleteFromUsersListOfPolls(pollName,username){
	var returnable;
	User.findOne({"identifier":username},function(err,poll){
		if(err) throw err;
		console.log("before splice: "+JSON.stringify(poll.polls));
		for(var i=0;i<poll.polls.length;i++){
			if(poll.polls[i].name===pollName){
				poll.polls.splice(i,1);
				poll.markModified("poll");
				poll.save();
				return poll;
			}
		}
		returnable=poll;
	})
	return returnable;
}