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
            
            console.log('results :'+results);
            
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

//댓글 추가 
var addComment = function(req,res){
    console.log('post.js의 addcomment 호출됨');

    var paramId = req.body.id || req.query.id; // 댓글말고 본 글의 아이디
    var paramComments = req.body.commentText || req.query.commentText; //  댓글 내용
    var paramWriter = req.body.writer || req.query.writer;

    console.log('parameter : ' + paramId + ', ' + paramComments + ', ' + paramWriter);

    var database = req.app.get('database');
    
    if(database) {
        database.postModel.findByIdAndUpdate(paramId, {$push :{comments:{contents:paramComments, writer: paramWriter}}}, function(err){
            if(err){
                console.log('댓글 추가 중 에러 발생 : ' +err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>게시판 댓글 추가 중 에러 발생</h2>');
                res.end();
                
                return;           
            }
            
            console.log('댓글 추가 완료 ');
            
            return res.redirect('/process/showpost/' + paramId);
        });
        
        
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }


}

// 업데이트 된 글 수정 
var updatePostConfirm = function (req, res) {
    console.log('post.js의 updatePostConfirm 호출됨');

    var paramTitle = req.body.title || req.query.title;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;
    var paramPostid = req.body.postId || req.query.postId;

    console.log('제목내용작가 글아이디 : ' + paramTitle + ', ' +paramContents+', '+ paramWriter+ ',' +paramPostid);

    var database = req.app.get('database');

    if (database) {
        database.postModel.findByIdAndUpdate(paramPostid,{$set: {title : paramTitle, contents : paramContents, updated_at : Date.now()}}, function(err){
            if(err){
                console.log('업데이트중 에러 발생 '+ err.stack);
            }
            
            res.redirect('/process/listpost?page=0&perPage=5');
            
        })
      
        
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
                result.clickedNum++;
                result.save();

                console.log('결과 :' + result);
                console.log('////////////////////////');
                // 뷰 렌더링
                res.writeHead('200', {
                    'Contett-Type': 'text/html;charset =utf8'
                });

                var context = {
                    title: '글 조회',
                    posts: result,
                    Entities: Entities,
                    clickedNum: result._doc.clickedNum
                };

                req.app.render('showpost', context, function (err, html) {
                    if (err) {
                        console.log('showpost 렌더링 중 오류 발생 ');
                        throw err;
                    }
                    
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
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}

// 해당 포스트 삭제 
var deletePost = function (req, res) {
    console.log('post.js의 deletepost 호출됨');

    var paramId = req.body.id || req.query.id || req.params.id;
    console.log('요청 파라미터 : ' + paramId);

    var database = req.app.get('database');

    if (database) {

        database.postModel.load(paramId, function (err, result) {
            if (err) {
                console.log('삭제할 글 조회 중 오류 발생 ' + err.stack);

                res.writeHead('200', {
                    'Contett-Type': 'text/html;charset =utf8'
                });
                res.write('<h2>삭제할 글 조회 중 오류 발생</h2>')
                res.end();

                return;
            }

            if (result) {

                // 글 삭제  
                result.delete();

                console.log('결과 :' + result);
                console.log('글 삭제됨 ');
                console.log('////////////////////////');


                // page, perpage 파라미터 전달 후 
                // 리스트 조회
                res.redirect('/process/listpost?page=0&perPage=5');

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

// 글 수정하는 페이지
var updatePostPage = function (req, res) {
    console.log('post.js의 updatepost 호출됨');

    var paramId = req.body.id || req.query.id;  
    console.log('요청 파라미터 : ' + paramId );
    
    var database = req.app.get('database');
    if (database) {
        database.postModel.load(paramId, function (err, result) {
            if (err) {
                console.log('err : '+err.stack );
            }
            
            if (result){
                // 뷰 렌더링
                res.writeHead('200', {
                   'Contett-Type': 'text/html;charset =utf8'
                });

                var context = {
                    title: '글 수정',
                    posts: result,
                    
                   // Entities: Entities,
                };
                
                req.app.render('updatepost', context, function (err, html) {
                    if (err) {
                        console.log('updatepost 렌더링 중 오류 발생 ');
                        throw err;
                    }
                   
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


module.exports.updatepostPage = updatePostPage;
module.exports.updatepostConfirm = updatePostConfirm;
module.exports.deletepost = deletePost;
module.exports.listpost = listPost;
module.exports.addpost = addPost;
module.exports.showpost = showPost;
module.exports.addcomment = addComment;
