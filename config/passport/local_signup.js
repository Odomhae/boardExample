var localStrategy = require('passport-local').Strategy;

// 패스포트 회원가입 설정 
module.exports = new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req,email, password, done){
    var paramName = req.body.name || req.query.name;
    console.log('passport login-signup 호출됨 : '+email + ','+password+ ','+paramName);
    
    process.nextTick(function(){
        var database = req.app.get('database');
        database.userModel.findOne({'email':email}, function(err, user){
            if(err) { return done(err);}
            
            //기존에 이메일이 있다면 
            if(user){
                console.log('이멜이 이미 있습니다 ');
                return done(null, false, req.flash('signUpMsg', '계정이 이미 있습니다dy'));
            }else{
                //모델 인스턴스 객체 만들어 저장 
                var user = new database.userModel({'email':email, 'password':password, 'name':paramName});
                user.save(function(err){
                    if(err){throw err;}
                    
                    console.log('사용자 데이터 추가함 ');
                    return done(null, user , req.flash('signUpMsg', '회원가입이 완료되었습니다.'));
                });
            }
        });
    });
});