var Entities = require('html-entities').AllHtmlEntities;


// 글 추가 
var addPost = function (req, res) {
    console.log('post.js의 addpost 호출됨');

    var paramTitle = req.body.title || req.query.title;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;

    console.log('parameter : ' + paramTitle + ', ' + paramWriter);

    var database = req.app.get('database');

    if (database) {
        //이메일로 등록된 사용자만 글쓸수 있으므로 
        database.userModel.findByEmail(paramWriter, function (err, results) {
            if (err) {
                console.log('게시판에 글 추가 중 오류 발생 ' + err.stack);

                res.writeHead('200', {
                    'Contett-Type': 'text/html;charset =utf8'
                });
                res.write('<h2>게시판에 글 추가 중 오류 발생</h2>')
                res.end();

                return;
            }

            if (results == undefined || results.length < 1) {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2> 사용자 [ ' + paramWriter + ']찾을 수 없음</h2>')
                res.end();

                return;

            }

            var userObjectId = results[0]._doc._id;
            console.log('사용자 objectid : ' + paramWriter + '=> ' + userObjectId);

            //저장
            var post = new database.postModel({
                title: paramTitle,
                contents: paramContents,
                writer: userObjectId
             //   clickedNum : 
            });

            post.savePost(function (err, result) {
                if (err) {
                    throw err;
                }

                console.log('글 데이터 추가함 ');
                console.log('포스팅 완료 : ' + post._id);
               
                return res.redirect('/process/showpost/' + post._id);

            });

        });
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}



// 쓴 글 조회 
var showPost = function (req, res) {
    console.log('post.js의 showpost 호출됨');

    var paramId = req.body.id || req.query.id || req.params.id;

    console.log('요청 파라미터 ' + paramId);

    var database = req.app.get('database');

    if (database) {
        // 글 리스트 
        database.postModel.load(paramId, function (err, result) {
            if (err) {
                console.log('게시판에 글 조회 중 오류 발생 ' + err.stack);

                res.writeHead('200', {
                    'Contett-Type': 'text/html;charset =utf8'
                });
                res.write('<h2>게시판에 글 조회 중 오류 발생</h2>')
                res.end();

                return;
            }

            if (result) {
                // 조회수 증가 
              //  result._doc.clickedNum++;
                result.clickedNum++;
                result.save();
                
                console.log('결과 :'+ result);
                console.log('////////////////////////');
                // 뷰 렌더링
                res.writeHead('200', {
                    'Contett-Type': 'text/html;charset =utf8'
                });

                var context = {
                    title: '글 조회',
                    posts: result,
                    Entities: Entities,
                    clickedNum : result._doc.clickedNum
                };

                req.app.render('showpost', context, function (err, html) {
                    if (err) {
                        console.log('showpost 렌더링 중 오류 발생 ');
                        throw err;
                    }
                    database.postModel.find
                    //console.log('showpost 응답문서 : ' + html);
                    res.end(html);
                });
            }
        })

    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

}


// 글 리스트 조회 
var listPost = function (req, res) {
    console.log('post.js의 listpost 호출됨');

    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;

    console.log('요청 파라미터 : ' + paramPage + ', ' + paramPerPage);

    var database = req.app.get('database');

    if (database) {

        var options = {
            page: paramPage,
            perPage: paramPerPage
        }

        database.postModel.list(options, function (err, result) {
            if (err) {
                console.log('게시판에 글 목록 조외 중 오류 발생 ' + err.stack);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>게시판에 글 목록 조외 중 오류 발생</h2>');
                res.end();

                return;
            }

            if (result) {
                console.log('결과 : ' + result);

                //전체 문서 객체 수 확인
                database.postModel.count().exec(function (err, cnt) {
                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });

                    //렌더링 후 전송
                    var context = {
                        title: '글 목록 ',
                        posts: result,
                        page: parseInt(paramPage),
                        pageCount: Math.ceil(cnt / paramPerPage),
                        perPage: paramPerPage,
                        totalRecords: cnt,
                        size: paramPerPage
                    };

                    req.app.render('listpost', context, function (err, html) {
                        if (err) {

                            console.log('글 목록 생성 중 오류 발생 ' + err.stack);

                            res.writeHead('200', {
                                'Content-Type': 'text/html;charset=utf8'
                            });
                            res.write('<h2>글 목록 생성 중 오류 발생</h2>');
                            res.end();

                            return;

                        }

                       // console.log('글목록 :' + html);
                        res.end(html);
                    });
                });
            }


        });
    }
}


module.exports.listpost = listPost;
module.exports.addpost = addPost;
module.exports.showpost = showPost;
