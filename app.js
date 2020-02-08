var express = require('express'),
    http = require('http'),
    path = require('path');

var bodyParser = require('body-parser'),
    static = require('serve-static'),
    expressErrorHandler = require('express-error-handler'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session');

var mongoClient = require('mongodb').MongoClient,
    mongodb = require('mongodb'),
    mongoose = require('mongoose');

var crypto = require('crypto');

var passport = require('passport'),
    flash = require('connect-flash');

var config = require('./config/config'),
    route_loader = require('./routes/router_loader'),
    user = require('./routes/user'),
    database = require('./database/database');


var app = express();

app.set('port', process.env.port || config.server_port);
console.log('포트번호 세팅 : '+ app.get('port'));

//app.set('views', path.join(__dirname, 'views'));
// view 속성값으로 views 폴더를 지정 
app.set('views', __dirname +'/views');
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');
console.log('뷰엔진 : '+ app.get('view engine'));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
// public 폴더의 파일들을 웹 서버의 /public 패스로 접근하도록 한다
app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 로컬 스트래티지 설정 
/*var localStrategy = require('passport-local').Strategy;

// 패스포트 로그인 설정 
passport.use('local-login', new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    
}, function(req,email, password, done){
     console.log('패스포트의 local-login 호출됨 '+ email+', '+password);
    
    var database = app.get('database');
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
    
}));

// 패스포트 회원가입 설정 
passport.use('local-signup', new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req,email, password, done){
    var paramName = req.body.name || req.query.name;
    console.log('passport login-signup 호출됨 : '+email + ','+password+ ','+paramName);
    
    process.nextTick(function(){
        var database = app.get('database');
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
}));  


//사용자 인증에 성공했을시 호출
passport.serializeUser(function(user, done){
    console.log('serializeUser 호출됨');
    console.log(user);
    
    done(null, user);
});

//사용자 인증 후(로그인 후) 요청이 있을때마다 호출 
passport.deserializeUser(function(user, done){
     console.log('deserializeUser 호출됨');
    console.log(user);
    
    done(null, user); 
});*/

var configPassport = require('./config/passport');
configPassport(app, passport);

console.log(' ');

var router = express.Router();
//route_loader.init(app, router);

// 라우터 객체 등록
app.use('/', router);


//홈 화면 
/*router.route('/').get(function(req,res){
    console.log('/ 호출됨');
    res.render('index.ejs');
});

//로그인 폼 링크
/*app.get('/login',function(req,res){
    console.log('/login 호출됨');
    res.render('login.ejs', {message : req.flash('loginMsg')});
});*/

/*router.route('/login').get(function(req, res) {
	console.log('/login 패스 요청됨.');
	res.render('login.ejs', {message: req.flash('loginMsg')});
});

router.route('/login').post(passport.authenticate('local-login',{
    successRedirect :'/profile',
    failureRedirect :'login',
    failureFlash : true
}))


// 회원가입 폼 링크 
router.route('/signup').get(function(req,res){
    console.log('/signup 패스 요청됨');
    res.render('signup.ejs', {message : req.flash('signUpMsg')});
});

router.route('/signup').post(passport.authenticate('local-signup',{
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true,
    successFlash : true
}));

//프로필 화면 
router.route('/profile').get(function(req,res){
    console.log('/profile 패스 요청됨');
    
    console.log('req.user 객체의 값: '+req.user);
    
    //인증이 안된경우 
    if(!req.user){
        console.log('로그인 안됐음');
        res.redirect('/');
        return;
        
        //인증됬으면
    }else{
        console.log('로그인된 상태로 사용자 인증된 상태임 ');
        //배열이면
        if(Array.isArray(req.user)){
            res.render('profile.ejs', {user:req.user[0]._doc});
        }else{
            res.render('profile.ejs', {message :req.flash('signUpMsg') , user:req.user});
        }
    }
});

// 로그아웃
router.route('/logout').get(function(req,res){
    console.log('/logout 패스 요청됨 ');
    req.logout();
    res.redirect('/');
});*/


var userPassport = require('./routes/user_passport');
userPassport(app, passport);

var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

app.listen(app.get('port'), function () {
    console.log('Server Started ' + app.get('port'));

    //db연결, 스키마&모델 정의 
    database.init(app, config);
});
console.log('10');