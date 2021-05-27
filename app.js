var express = require("express");
var ejs = require("ejs");

var app = express();

app.set("view engine","ejs");
app.use(express.static(__dirname + '/'));

var indexRouter = require('./routes/index')

app.use('/',indexRouter);

app.listen(3000);