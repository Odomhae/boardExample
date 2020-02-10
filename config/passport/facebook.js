var facebookStrategy = require('passport-facebook').Strategy;
var config = require('../config');

module.exports = function(app, passport){
    return new facebookStrategy({
        clientID : config.facebook.clientID,
        clientSecret : config.facebook.clientSecret,
        clientURL : config.facebook.callbackURL
        
    },function(accessToken, refreshToken, profile, done){
        console.log('passport의 facebook.js 호출됨');
        console.log(profile);
        
        var options = {
            criteria :{'facebook.id' : profile.id}
        };
        
        var database = app.get('database');
        database.userModel.load(options, function(err,user){
            if(err) {return done(err);}
            
            if(!user){
                var user = new database.userModel({
                    name : profile.displayName,
                    email : profile.email[0].value,
                    provider : 'facebook',
                    facebook : profile._json
                });
                
                user.save(function(err){
                    if(err) {
                        console.log(err);
                        return done(err,user);
                    }
                });
            }else{
                return done(null, user);
            }
        });
    });
};