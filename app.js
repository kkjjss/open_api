var express = require("express");
var ejs = require("ejs");
var fs = require("fs");
var mysql = require('mysql');
const { json } = require("body-parser");

var app = express();


//DB 설정
var DBoptions = JSON.parse(fs.readFileSync('./private/DBoptions.json'));
const sqlConnection = mysql.createConnection(DBoptions);
sqlConnection.connect();





//EJS 설정
app.set("view engine","ejs");
app.use(express.static(__dirname + '/'));

//라우터
var indexRouter = require('./routes/index')
var signupRouter = require('./routes/signup')



app.use('/',indexRouter);
app.use('/signup',signupRouter);


app.listen(3000);