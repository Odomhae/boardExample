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
    database = require('./database/database'),
    configPassport = require('./config/passport'),
    userPassport = require('./routes/user_passport');


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


configPassport(app, passport);

console.log(' ');

var router = express.Router();
//route_loader.init(app, router);

// 라우터 객체 등록
app.use('/', router);


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