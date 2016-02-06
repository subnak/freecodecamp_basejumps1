'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');
var LocalStrategy=require('passport-local').Strategy;

module.exports = function (passport) {
	var User = require('../models/users');
	
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.identifier = email;
                newUser.polls = [];

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));
    
    passport.use('local-login', new LocalStrategy({
    	usernameField: 'email',
    	passwordField: 'password',
    	passReqToCallback: true
    },
    function(req,email,password,done){
    	process.nextTick(function(){
    		User.findOne({'local.email':email},function(err,user){
    			if(err) return done(err);
    			
    			if(!user){
    				return done(null,false,req.flash('loginMessage','No user found'));
    			}
    			
    			if(!user.validPassword(password)){
    				return done(null,false,req.flash('loginMessage','Oops! Wrong password.'));
    			}
    			
    			return done(null,user);
    		})
    	})
    }
    ));
	
	
	// passport.use(new LocalStrategy(
	//   function(username, password, done) {
	//   	alert("omg please work");
	//     User.findOne({ email: username }, function(err, user) {
	//       if (err) { return done(err); }
	//       if (!user) {
	//       	console.log("invalid username");
	//         return done(null, false, { message: 'Incorrect username.' });
	//       }
	//       if (!user.validPassword(password)) {
	//       	console.log("invalid password");
	//         return done(null, false, { message: 'Incorrect password.' });
	//       }
	//       return done(null, user);
	//     });
	//   }
	// ));
	

	// passport.use(new GitHubStrategy({
	// 	clientID: configAuth.githubAuth.clientID,
	// 	clientSecret: configAuth.githubAuth.clientSecret,
	// 	callbackURL: configAuth.githubAuth.callbackURL
	// },
	// function (token, refreshToken, profile, done) {
	// 	process.nextTick(function () {
	// 		User.findOne({ 'github.id': profile.id }, function (err, user) {
	// 			if (err) {
	// 				return done(err);
	// 			}

	// 			if (user) {
	// 				return done(null, user);
	// 			} else {
	// 				var newUser = new User();

	// 				newUser.github.id = profile.id;
	// 				newUser.github.username = profile.username;
	// 				newUser.github.displayName = profile.displayName;
	// 				newUser.github.publicRepos = profile._json.public_repos;
	// 				newUser.nbrClicks.clicks = 0;

	// 				newUser.save(function (err) {
	// 					if (err) {
	// 						throw err;
	// 					}

	// 					return done(null, newUser);
	// 				});
	// 			}
	// 		});
	// 	});
	// }));
};
