var crypto = require('crypto');

var schema = {};

schema.createSchema = function (mongoose) {

    //스키마 정의
    // password를 hase- 로 변경 
    // 모두 default 속성 추가 
    // salt 속성 추가 
    userSchema = mongoose.Schema({
        email: {
            type: String,
            'default': ''
        },
       /* id: {
            type: String,
            required: true,
            unique: true,
            'default': ' '
        },*/
        hashed_password: {
            type: String,
           // required: true,
            'default': ' '
        },
        salt: {
            type: String,
            //required: true
        },
        name: {
            type: String,
            index: 'hashed',
            default: ' ',
            unique : true
        },
        /*age: {
            type: Number,
            'default': -1
        },*/
        created_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        },
        updated_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        },
        provider:{
            type : String,
            'default' : ''
        },
        authToken : {
            type :String,
            'default' : ''
        },
        //facebook :{}
        google : {}
    });

    // info를 virtual 메소드로 정의
    userSchema
        .virtual('password')
        .set(function (password) {
            //console.log('레레레');
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('virtual password set 호출됨 : ' + this.hashed_password);
        })
        .get(function () {
            console.log('virtual password의 get 호출됨.');
            return this._password;
        });

    //스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 비밀번호 암호화 메소드
    userSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    //salt 값 만들기 
    userSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + ' ';
    });

    // 입력된 비번이랑 비교 (true / false 리턴)
    userSchema.method('authenticate', function (plainText, inSalt, hashed_password) {
        if (inSalt) {
            console.log('authenticate 호출됨1 : %s => %s : ss %s, %s', plainText, this.encryptPassword(plainText, inSalt), inSalt, hashed_password);
            return this.encryptPassword(plainText, inSalt) === hashed_password;
        } else {
            console.log('authenticate 호출됨2 : %s => %s : %s', plainText, this.encryptPassword(plainText), hashed_password);
            return this.encryptPassword(plainText) === hashed_password;

        }
    });

    // 필수 속성에 대한 유효성 확인
   /* userSchema.path('email').validate(function (email) {
        return email.length;
    }, 'id 값이 없슴다');

    userSchema.path('hashed_password').validate(function (hashed_password) {
        return hashed_password.length;
    }, 'hashed_password 칼럼의 값이 없습니다.'); */


    // 스키마에 static 메소드 추가
    //id 속엉을 전닯망아 검색후 콜백으로 결과 넘겨줌
    userSchema.static('findByEmail', function (email, callback) {
        return this.find({email: email}, callback);
    });
    //모든 문서 데이터 반환
    userSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });


    console.log('user 스키마 정의됨');

    return userSchema;

};

//userSchema 직접 할당 
module.exports = schema;
