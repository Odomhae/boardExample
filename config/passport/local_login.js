var localStrategy = require('passport-local').Strategy;

module.exports =  new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    
}, function(req,email, password, done){
     console.log('패스포트의 local-login 호출됨 '+ email+', '+password);
    
    var database = req.app.get('database');
    database.userModel.findOne({'email':email}, function(err,user){ //검증 콜백 
        if(err){return done(err)};
        
        //등록된 사용자 없는 경우 
        if(!user){
            console.log('계정이 일치하지 않음 ');
            return done(null, false, req.flash('loginMsg', '등록된 계정이 없습니다 '))
        }
        
        //비밀번호가 일치하지 않는 경우 
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        if(!authenticated){
            console.log('비번 일치x');
            return done(null, false, req.flash('loginMsg', '비번이 일치하지 않습니다'));
        }
        
        //정상인 경우
        console.log('계정과 비번이 일치함');
        return done(null, user);
    });
    
});