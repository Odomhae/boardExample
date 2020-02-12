var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../config');

module.exports = function(app, passport) {
	return new GoogleStrategy({
    	clientID: config.google.clientID,
    	clientSecret: config.google.clientSecret,
    	callbackURL: config.google.callbackURL
	}, function(accessToken, refreshToken, profile, done) {
		console.log('passport의 googlee 호출됨.');
		console.dir(profile);
		console.log('///////////////////');   
		var options = {
		    criteria: { 'google.id': profile.id }
		};
		
		var database = app.get('database');
	    database.userModel.findOne(options, function (err, user) {
			if (err) {console.log(err.stack); return done(err);}
      
			if (!user) {
				var user = new database.userModel({
					name: profile.displayName,
			  //      email: profile.emails[0].value,
                    id : profile.id,
			        provider: 'google',
			        google: profile._json
				});
        
				user.save(function (err) {
					if (err) console.log(err);
					return done(err, user);
				});
			} else {
				return done(err, user);
			}
	    });
	});
};