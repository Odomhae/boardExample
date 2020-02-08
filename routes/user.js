var adduser = function(req,res){
    console.log('/process/adduser 호출됨');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);

    // 데이터베이스 객체 참조
	var database = req.app.get('database');
    
    //db 연결됬으면
    if (database) {
        addUser(database, paramId, paramPassword, paramName, function (err, result) {
            if (err) {
                console.log('사용자 추가 중 에러발생' + err.stack);
                res.send('<h2>사용자 추가 중 에러 발생</h2>');
                res.send('<p>'+ err.stack+ '</p>');
                res.end();
            }

            // 추가된 거 있으면 
            if (result) { // && result.insertedCount >0 ){
                console.log('res11 : ' + result);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                
                var context = {title: ' 사용자 추가 성공 '}
                req.app.render('adduser', context, function(err, html){
                    if(err) {
                        console.log('뷰 렌더링중 오류 발생 : '+err.stack);
                        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                        res.write('<h1> 뷰 렌더링 중 오류 발생 </h1>')
                        res.write('<p>' + err.stack+'</p>')
                        res.end();
                        
                        return;
                    };
                    
                    console.log("rendered : "+html );
                    res.end(html);
                })
                
                /*res.write('<h1> 사용자 추가 성공 </h1>');
                res.write('<div><p>사용자 id : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 name : ' + paramName + '</p></div>');
                res.end(); */
                //추가할거 없으면     
            } else {
                console.log('res 22: ' + result);
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h1> 추가 실패 </h1>');
                res.write("<br><br><a href = '/public/adduser.html'> 사용자 추가하기 </a>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h1> DB 연결 실패 </h1>');
        res.end();
    }
};


var login = function(req,res){
    console.log('/process/login 호출됨 ');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');

    //db가 연결되었으면
    if (database) {
        authUser(database, paramId, paramPassword, function (err, docs) {
            if (err) {
                console.log(err.stack);
                throw err;
            }

            if (docs) {
                console.dir(docs);
                var userName = docs[0].name;
                
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                
                // 뷰 템플릿으로 렌더링 후 전송 
                var context = {userid: paramId, username :userName};
                req.app.render('login_success', context, function(err, html){
                    if(err){
                        console.log('뷰 렌더링 중 오류 발생 : '+err.stack);
                        
                        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                        res.write('<h1> 뷰 렌더링 중 오류 발생 </h1>');
                        res.write('<p>' + err.stack +  '</p>');
                        res.write("<br><br><a href='/public/login.html'> 다시 로그인 </a>");
                        res.end();
                        
                        return;
                    }
                    
                    console.log('rendered : '+html);
                    
                    res.end(html);
                });
                
               /* res.write('<h1> sasef로그인 성공 </h1>');
                res.write('<div><p>Param id : ' + paramId + '</p></div>');
                res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
                res.write("<br><br><a href='/public/login.html'> 다시 로그인 </a>");
                res.end(); */
            } else {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h1> 로그인 실패 </h1>');
                res.write('<div><p> 아이디랑 비번 다시 확인 </p></div>');
                res.write("<br><br><a href='/public/login.html'> 다시 로그인 </a>");
                res.end();
            }
        });
        //db랑 연결안됬으면
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h1> DB 연결 실패 </h1>');
        res.write('<div><p> DB에 연결하지 못했습니다 </p></div>');
        //res.write("<br><br><a href='/public/login.html'> 다시 로그인 </a>");
        res.end();
    }
}



var listuser = function(req,res){
    console.log('/process/listuser 호출됨');
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');

    // db 연결되면 
    if (database) {
        database.userModel.findAll(function (err, results) {
            if (err) {
                console.log('사용자 리스트 조회중 에러 발생 : ' + err.stack);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h1> 사용자 리스트 조회중 에러 발생 </h1>');
                res.write('<p>' + err.stack + '</p');
                res.end();

                return;
            }

            //결과 있으면 
            if (results.length > 0) { // results.length>0 ??
                console.dir(results);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8' });
                
                // 뷰 렌더링 후 전송 
                var context = {results : results};
                req.app.render('listuser', context, function(err,html){
                    if(err) {
                        console.log('뷰 렌더링중 오류 발생'+ err.stack);
                        throw err;}
                    
                    console.log('rendered : '+html);
                    res.end(html);
                });
               /* res.write('<h1> 사용자 리스트 </h1>');
                res.write('<div><ul>');

                for (var i = 0; i < results.length; i++) {
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write('    <li>#' + (i + 1) + ' : ' + curId + ', ' + curName + '</li>');
                }

                res.write('<div><ul>');
                res.end();*/
                //결과 없으면    
            } else {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h1> 사용자 리스트 조회 실패</h1>');
                res.end();
            }
        });
    } else {
        console.log('db 연결 오류 ');
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h1> DB 연결 실패</h1>');
        res.end();
    }
}






// 사용자 인증
var authUser = function (database, id, password, callback) {
    console.log('authUser 함수 호출됨');

    //ID로 검색 
    database.userModel.findById(id, function (err, results) { //database.userModel !!!!!
        if (err) {
            callback(err, null);
            return;
        }

        console.log('ID : %s로 검색 결과 ', id);
        console.log(results);

        if (results.length > 0) {
            console.log('ID와 일치하는 사용자 찾음');
            
            //비밀번호 확인
            var user = new database.userModel({id : id}); //database.userModel
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
            
            if(authenticated){
                console.log('비밀번호 일치함');
                callback(null, results);
            }else{
                console.log('비밀번호가 일치하지 않음 ');
                callback(null,null);
            }

            //비밀번호 확인
            /*if (results[0]._doc.password == password) {
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }*/

        } else {
            console.log('ID와 일치하는 사용자 못찾음');
            callback(null, null);
        }
    });

    //id랑 비번으로 인증여부 확인
    /* userModel.find({"id":id, "password":password}, function(err,results){
         if(err){
             callback(err,null);
             return;
         }
         
         console.log('id :%s, password: %s 로 검색한 결과', id, password);
         console.dir(results);
         
         if(results.length > 0){
             console.log('일치하는 ㅅ 찾음');
             callback(null, results);
         }else{
             console.log('일치하는 사람 없음');
             callback(null,null);
         }
     }); */

}

// 사용자 추가
var addUser = function (database, id, password, name, callback) {
    console.log('adduser 호출됨 ' + id);

    // userModel 인스턴스 생성
    var user = new database.userModel({ //database.userModel !!!!!!!
        "id": id,
        "password": password,
        "name": name
    });

    user.save(function (err, user) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가함');
        callback(null, user);
    });

}




/*var init = function(db, schema, model){
    console.log('init 호출됨 ');
    
    database = db;
    userSchema = schema;
    usermodel = model;
    
}*/

//module.exports.init = init;
module.exports.adduser = adduser;
module.exports.login = login;
module.exports.listuser = listuser;
