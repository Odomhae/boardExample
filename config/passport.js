var local_login = require('./passport/local_login');
var local_signup = require('./passport/local_signup');

module.exports = function (app, passport) {
    
    console.log('/config/passport.js 호출됨');
    
    //사용자 인증에 성공했을시 호출
    passport.serializeUser(function (user, done) {
        console.log('serializeUser 호출됨');
        console.log(user);

        done(null, user);
    });

    //사용자 인증 후(로그인 후) 요청이 있을때마다 호출 
    passport.deserializeUser(function (user, done) {
        console.log('deserializeUser 호출됨');
        console.log(user);

        done(null, user);
    });
    
    //인증방식 설정 
    passport.use('local-login', local_login);
    passport.use('local-signup', local_signup);
    console.log('인증방식 설정')
    /*
    모듈화전에는 
    passport.use('local-login', new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        ...
        */

};