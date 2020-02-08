var mongoose = require('mongoose');

var database = {};

database.init = function(app, config){
    console.log('init 함수 호출됨 ');
    
    connect(app, config);
}

function connect(app, config){
    console.log('connect 함수 호출됨')
    
    var databaseUrl = 'mongodb://localhost:27017/local';

    //db 연결
    console.log('....db에 연결합니다. ');
    //기본 promise(mPromise)를 노드의 promise로 교체
    mongoose.promise = global.promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    //db 연결이 안됬을때 
    database.on('error', console.error.bind(console, 'mongoose 연결 error'));

    //db가 연결됬을때 
    database.on('open', function () {
        console.log('db에 연결됬습니다. :' + databaseUrl);

        // 스키마 및 모델 정의
        createSchema(app,config);
    });

    //연결이 끊어졌을때  5초 후 다시 연결 
    database.on('disconnected', function () {
        console.log('연결 끊어짐. 5초후 다시 연결합니다');
        setInterval(connectDB, 5000);
    });
    
    
    // app 객체에 database 속성 추가
    app.set('database', database);
}

function createSchema(app, config){ 
    var schemaLen =  config.db_schemas.length
    console.log('config에 정의된 스키마 수 : '+ schemaLen);
    
    for(var i = 0;i<schemaLen;i++){
        var curItem = config.db_schemas[i];
        
        var curSchema = require(curItem.file).createSchema(mongoose); // user_schema에 정의된 createSchema 함수임 
        console.log('%s 모듈을 물러온 후 스키마 정의함 ', curItem.file); // './database/user_schema'
        
        // 사용자 모델 정의 
        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위한 모델 정의함 ', curItem.collection);
        
        //database 객체에 속성 추가
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마이름 : %s, 모델이름 : %s이 database 객체의 속성으로 추가됨', curItem.schemaName, curItem.modelName); // config.db_schemas[i].modelName
    }
    
    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨')
    
}

module.exports = database;
