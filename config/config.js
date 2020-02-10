module.exports = {
    
    server_port :3000,
    db_url : 'mongodb://localhost:27017/local',
    
    db_schemas : [
      //  {file:'./user_schema', collection:'users3', schemaName: 'userSchema',
    //    modelName:'userModel'},
     //   {file:'./user_schema', collection:'users5', schemaName: 'userSchema',
    //    modelName:'userModel'}
         {file:'./user_schema', collection:'users6', schemaName: 'userSchema',
        modelName:'userModel'}
        
    ],
    
    route_info : [
        //{file:'./user', path:'/process/login', method:'login', type: 'post'},
        //{file:'./user', path:'/process/adduser', method:'adduser', type: 'post'},
        //{file:'./user', path:'/process/listuser', method:'listuser', type: 'post'}
    ],
    
    facebook : {
        clientID : '1084485908563881',
        clientSecret : '60bf7a0c679ad5a04963f2a568ea56c5',
        callbackURL : '/auth/facebook/callback'
    },
    google: {		
		clientID: '616994572250-7pf21pb0bhtdhd0vns4v4itlp0alg0ve.apps.googleusercontent.com',
		clientSecret: '1R8IZEGVmezNeFLgfeQJwkuR',
		callbackURL: '/auth/google/callback'
	}
}