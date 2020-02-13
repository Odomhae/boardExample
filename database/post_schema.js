var utils = require('../utils/utils');

var schemaObj = {};

schemaObj.createSchema = function (mongoose) {

    //스키마 정의 
    var postSchema = mongoose.Schema({
        title: {
            type: String,
            trim: true,
            'default': ''
        },
        contents: {
            type: String,
            trim: true,
            default: ''
        },
        
        // user6 컬렉션을 참고해서 이 문서 객체 중 objectid 속성값이 저장된다 .
        writer: {
            type: mongoose.Schema.ObjectId,
            ref: 'users6'
        },
        tags: {
            type: [],
            default: ''
        },
        created_at: {
            type: Date,
            index: {
                unique: false
            },
            default: Date.now
        },
        updated_at: {
            type: Date,
            index: {unique: false},
            default: Date.now
        },
        clickedNum :{
            type : Number,
            default : 0
        },
        comments: [{
            contents: {
                type: String,
                trim: true,
                default: ''
            },
            writer: {
                type: mongoose.Schema.ObjectId,
                ref: 'users6'
            },
            created_at: {
                type: Date,
                default: Date.now
            }
        }]
    });


    // 필수 항목 확인 
    postSchema.path('title').required(true, '글 제목을 입력하세요 ');
    postSchema.path('contents').required(true, '글 내용을 입력하세요 ');

    // 스키마 메소드 추가 
    //인스턴스에서 호출가능한 메소드 추가
    postSchema.methods = {
        // 글저장
        savePost: function (callback) {
            var self = this;

            this.validate(function (err) {
                if (err) return callback(err);

                self.save(callback);
            });
        },

        // 댓글 추가 
        addComment: function (user, comment, callback) {
            this.comment.push({ // 댓글이 배열로 정의되어있으니 push로 추가
                contents: comment.contents,
                writer: user._id
            });

            this.save(callback);
        },

        // 댓글 삭제 
        // id로 검색 후 삭제 
        removeComment: function (id, callback) {
            var index = utils.indexOf(this.comments, {
                id: id
            });

            if (~index) { // splice로 삭제
                this.comments.splice(index, 1);
            } else {
                return callback('ID [' + id + ']를 가진 댓글을 삭제할 수 없습니다');
            }

            this.save(callback);
        }
    }
    
    
    //객체에서 호출가능한 메소드 추가
    postSchema. statics = {
        
        //id로 글 찾기 
        load : function(id, callback){
            this.findOne({_id : id})
            .populate('writer' , 'name provider email')
            .populate('comments.writer')
            .exec(callback);
        },
        
        // 모든 데이터 조회
        list : function(options, callback){
            var criteria = options.criteria || {};
            
            this.find(criteria)
            .populate('writer', 'name provider email')
            .sort({'created_at' :-1})
            .limit(Number(options.perPage))
            .skip(options.perPage * options.page)
            .exec(callback);
        }
        
        
    }
    
    console.log('post schema 정의함 ');
    
    return postSchema;
    
}

module.exports = schemaObj;