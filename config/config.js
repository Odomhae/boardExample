module.exports = {
    
    server_port :3000,
    db_url : 'mongodb://localhost:27017/local',
    
    db_schemas : [
         {file:'./user_schema', collection:'users6', schemaName: 'userSchema',
        modelName:'userModel'}
        ,
        {file:'./post_schema', collection:'post', schemaName: 'postSchema',
        modelName:'postModel'}
        
    ],
    
    route_info : [
        {file:'./post', path:'/process/addpost/', method:'addpost', type: 'post'},
        {file:'./post', path:'/process/showpost/:id', method:'showpost', type: 'get'},
         {file:'./post', path:'/process/listpost', method:'listpost', type: 'post'},
         {file:'./post', path:'/process/listpost', method:'listpost', type: 'get'},
         {file:'./post', path:'/process/deletepost', method:'deletepost', type: 'post'} // have to 'post!!'
     
    ]
    
}