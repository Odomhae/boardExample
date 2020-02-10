var config = require('../config/config');

module.exports = function (router, passport) {
    console.log('user_passport 호출됨');

    //홈 화면 
    router.route('/').get(function (req, res) {
        console.log('/ 호출됨');
        var context ={"userId": config.facebook.clientID}
        res.render('index.ejs', context);
    });

    //로그인 폼 링크
    /*app.get('/login',function(req,res){
        console.log('/login 호출됨');
        res.render('login.ejs', {message : req.flash('loginMsg')});
    });*/

    router.route('/login').get(function (req, res) {
        console.log('/login 패스 요청됨.');
        res.render('login.ejs', {
            message: req.flash('loginMsg')
        });
    });

    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }))


    // 회원가입 폼 링크 
    router.route('/signup').get(function (req, res) {
        console.log('/signup 패스 요청됨');
        res.render('signup.ejs', {
            message: req.flash('signUpMsg')
        });
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true,
        successFlash: true
    }));

    //프로필 화면 
    router.route('/profile').get(function (req, res) {
        console.log('/profile 패스 요청됨');

        console.log('req.user 객체의 값: ' + req.user);

        //인증이 안된경우 
        if (!req.user) {
            console.log('로그인 안됐음');
            res.redirect('/');
            return;

            //인증됬으면
        } else {
            console.log('로그인된 상태로 사용자 인증된 상태임 ');
            //배열이면
            if (Array.isArray(req.user)) {
                res.render('profile.ejs', {
                    user: req.user[0]._doc
                });
            } else {
                res.render('profile.ejs', {
                    message: req.flash('signUpMsg'),
                    user: req.user
                });
            }
        }
    });

    // 로그아웃
    router.route('/logout').get(function (req, res) {
        console.log('/logout 패스 요청됨 ');
        req.logout();
        res.redirect('/');
    });
    
    
    //페에스북 페스포트 
    router.route('/auth/facebook').get(passport.authenticate('facebook',{
        scope : 'email'
    }));
    //패스포트 페이스북 인증 콜백 라우팅
    router.route('auth/facebook/callback').get(passport.authenticate('facebook',{
        successRedirect : '/profile',
        failureRedirect : '/'
    }));
    
    //구글 패스포트 
    router.route('/auth/google').get(passport.authenticate('google',{
        scope : 'profile'
    }));
    router.route('/auth/google/callback').get(passport.authenticate('google',{
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


}