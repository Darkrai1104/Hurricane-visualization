var http   = require('http');// 引入 http 模块，创建服务器
var url    =require('url')// 引入 url 模块，解析 url 地址
var mysql  = require('mysql');
var express = require("express");
var fs = require('fs');
//异步调用
const exec = require('child_process').exec;

//////////////
var databaseName="0"
//////////////
//搭建服务器
var app = express();

app.use(express.static("systems")).listen(8080,function () {
    console.log("http://localhost:8080");
});

//处理请求
app.get('/get',function(req,res){
    console.time('test')

    var  sql = 'SELECT * FROM p01 ';
    //查
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        var list=[];
        for (var i=0;i<result.length;i++) {
            list.push([result[i].value,result[i].r,result[i].x,result[i].y,result[i].z]);
        }
        res.send(list);
    });

   //先不关 connection.end();
    //结束时间
    console.timeEnd('test');

});

//获取信息熵z
app.get('/getEntropy',function(req,res){

    var  sql = 'SELECT * FROM z';
    var value1=String(req.query.value1).toLowerCase()
    var value2=String(req.query.value2).toLowerCase()
    var value3=String(req.query.value3).toLowerCase()
    console.log(value1,value2,value3)
    connect_databaseconnect_database("informationentropy");
    //查
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }

        let dataString = JSON.stringify(result);

        let data = JSON.parse(dataString);
        var list=[];
        for (var i=0;i<data.length;i++) {
            list.push([data[i][value1],data[i][value2],data[i][value3]]);
        }
        res.send(list);
    });
    disconnect_database();
});
//获取信息熵hour
app.get('/getMutual',function(req,res){

    var  sql = 'SELECT * FROM hour';
    var value1=String(req.query.value1).toLowerCase()
    var value2=String(req.query.value2).toLowerCase()
    var value3=String(req.query.value3).toLowerCase()
    connect_databaseconnect_database("informationentropy");
    //查

    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        let dataString = JSON.stringify(result);
        let data = JSON.parse(dataString);
        var list=[];
        for (var i=0;i<data.length;i++) {
            list.push([data[i][value1],data[i][value2],data[i][value3]]);
        }
        res.send(list);
    });
    disconnect_database();
});
app.get('/getsel',function(req,res){
    // 异步执行 调用python文件
    var arg1=req.query.data
    exec('python web.py '+ arg1+' ',function(error,stdout,stderr){
        if(error) {
            console.info('stderr : '+stderr);
        }
        console.log(stdout);

    })

});
app.get('/getdata',function(req,res){
    console.time('test')
    var attribute=String(req.query.attr)//.toLowerCase()//小写
    var hour =String(req.query.hour)
    var z=String(req.query.z)
    //读取json文件
    var file = 'D:\\webgl\\JSON\\'+attribute+"\\"+String(hour)+'\\'+String(z)+'.json';
    //console.log(file)
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) {
            console.log(err)
            res.send('文件读取失败');
        } else {
            res.send(data);
        }
    });

    console.timeEnd('test');
});
app.get('/getradar',function(req,res){
    var x=parseInt(req.query.x)//.toLowerCase()//小写
    var y =parseInt(req.query.y)
    var z=parseInt(req.query.z)
    var id=String(x+500*z+500*500*y)
    var hour=String(req.query.hour)
    var  sql = 'SELECT p,tc,qvapor,precip,cloud FROM h'+hour+' where id='+id;
    console.log(sql)
    connect_databaseconnect_database("radardata");
    //查
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        var list=[];
            list.push([result[0].p,result[0].tc,result[0].qvapor,result[0].precip,result[0].cloud]);
        res.send(list);
    });
    disconnect_database();
});
app.get('/getkmeans',function(req,res){
    var table=String(req.query.table)//.toLowerCase()//小写
    var  sql = 'SELECT * from '+table
    console.log(sql)
    connect_databaseconnect_database("kmeans");
    //查
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        // var list=[];
        // for (var i=0;i<result.length;i++) {
        //     list.push([result[i].P,result[i].TC,result[i].QVAPOR]);
        // }
        res.send(result);
    });
    disconnect_database();
});
app.get('/getsubdata',function(req,res){
    var attribute=String(req.query.attr)//.toLowerCase()//小写
    var hour =String(req.query.hour)
    var z=String(req.query.z)
    //console.log(777)
    //读取json文件
    var file = 'D:\\webgl\\JSON\\'+attribute+"\\"+String(hour)+'\\'+String(z)+'.json';
    //console.log(file)
    fs.readFile(file, 'utf-8', function(err, data) {
            var data=JSON.parse(data)
            res.send(data)
    });


});
app.get('/getFeature',function(req,res){
    //console.log(777)
    //读取json文件
    var file = 'D:\\webgl\\JSON\\FeatureProcess.json';
    //console.log(file)
    fs.readFile(file, 'utf-8', function(err, data) {
        var data=JSON.parse(data)
        res.send(data)
    });


});
app.get('/getmodeldata',function(req,res){
    //console.log(777)
    //读取json文件
    let minvalue =req.query.min
    let maxvalue =req.query.max
    let hour =req.query.hour
    console.log("hour:",hour)
    var file = 'D:/webgl/JSON/model/p/'+String(hour)+'.json';
    //console.log(file)
    fs.readFile(file, 'utf-8', function(err, data) {
        var data=JSON.parse(data)
        let list=data.filter((t)=>{
            return t.value>minvalue && t.value <maxvalue
        })
        // var max=0;var min=100;
        // let x=list.filter((t)=>{
        //     return
        // })
        //console.log(list)
        let zlist=(list.map(x=>[x.x,x.y,x.z]))
        //console.log(zlist)
        // let zmax=0;let zmin=100;
        // for(let i =0;i<zlist.length;i++){
        //     if(zmax<zlist[i])
        //         zmax=zlist[i];
        //     if(zmin>zlist[i])
        //         zmin=zlist[i]
        // }
        // console.log(zmax,zmin)
        // var finlist=[]
        // for(let i=zmin;i<=zmax;i++){
        //     let zdata=list.filter((t)=>{
        //         return t.z==i
        //     })
        //     finlist.push(setpoints(zdata))
        // }
        //处理点 只要边缘位置的点
        // function setpoints(data){
        //     //console.log(data)
        //     let pointlist=[]
        //     for(let i =0;i<data.length;i++){
        //         if(pointlist.length==0)
        //             pointlist.push([data[i].x,data[i].y,i])
        //         else
        //             calculatepoint(data[i].x,data[i].y,i)
        //     }
        //     return pointlist
        //     function calculatepoint(x,y,index) {
        //         let xlist=[]
        //         let ylist=[]
        //         for (let i=0;i<pointlist.length;i++){
        //             if(pointlist[i][0]==x)
        //                 xlist.push([pointlist[i][0],pointlist[i][1],pointlist[i][2]])
        //             if(pointlist[i][1]==y)
        //                 ylist.push([pointlist[i][0],pointlist[i][1],pointlist[i][2]])
        //         }
        //         //删除中间点
        //         if(xlist.length>2){
        //             //排序
        //             xlist.sort(function(x, y){
        //                 return x[0]-y[0];
        //             });
        //             if (xlist[1][2]!=index){
        //                 //删除中间数组的元素
        //                 let t=pointlist.filter(function (item) {
        //                     return item[2]!=xlist[1][2]
        //                 })
        //                 pointlist=t
        //                 outer:
        //                     for (let i=0;i<3;i+=2)
        //                         for(let j=0;j<pointlist.length;j++){
        //                             if(xlist[i][2]==pointlist[j][2]) {
        //                                 pointlist.push([xlist[2 - i][0], xlist[2 - i][1], xlist[2 - i][2]])
        //                                 break outer
        //                             }
        //                         }
        //             }
        //         }
        //         else pointlist.push([x,y,index]);
        //         if(ylist.length>2){
        //             //排序
        //             ylist.sort(function(x, y){
        //                 return x[0]-y[0];
        //             });
        //             if (ylist[1][2]!=index){
        //                 //删除中间数组的元素
        //                 let t=pointlist.filter(function (item) {
        //                     return item[2]!=ylist[1][2]
        //                 })
        //                 pointlist=t
        //                 outer:
        //                     for (let i=0;i<3;i+=2)
        //                         for(let j=0;j<pointlist.length;j++){
        //                             if(ylist[i][2]==pointlist[j][2]) {
        //                                 pointlist.push([ylist[2 - i][0], ylist[2 - i][1], ylist[2 - i][2]])
        //                                 break outer
        //                             }
        //                         }
        //             }
        //         }
        //         else pointlist.push([x,y,index]);
        //     }
        // }
        res.send(zlist)
    });


});
app.get('/getThreeType',function(req,res){
    console.time('test')
    var attribute=String(req.query.attr)//.toLowerCase()//小写
    var hour =String(req.query.hour)
    var z=String(req.query.z)
    //读取json文件
    var file1 = 'D:\\webgl\\JSON\\'+String(attribute)+"\\"+String(hour)+'\\'+String(z)+'.json';
    var file1 = 'D:\\webgl\\JSON\\'+String(attribute)+"\\"+String(hour)+'\\'+String(z)+'.json';
    var file1 = 'D:\\webgl\\JSON\\'+String(attribute)+"\\"+String(hour)+'\\'+String(z)+'.json';
    //console.log(file)
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) {
            console.log(err)
            res.send('文件读取失败');
        } else {
            res.send(data);
        }
    });

    console.timeEnd('test');
});
// app.post('/login', function(req, res) {
//     console.log("hello");
//     res.send("hello");
// });
var connection;
function connect_databaseconnect_database(databaseName) {
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        port: '3306',
        database: databaseName
    });
}
//数据库操作
function disconnect_database(){
    connection.end();
}

