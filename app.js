var express = require("express");
var ejs = require("ejs");
var fs = require("fs");
var mysql = require('mysql');
var bodyParser = require("body-parser");
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var app = express();

//DB 설정
var DBoptions = JSON.parse(fs.readFileSync('./private/DBoptions.json'));
const sqlConnection = mysql.createConnection(DBoptions);
sqlConnection.connect();

//EJS 설정
app.set("view engine","ejs");
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }));


//세션 설정
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(DBoptions)
}));

//passport 설정
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function(user, done) {
    done(null, user.email); 
});

passport.deserializeUser(function(email, done) {
    sqlConnection.query('SELECT name, email FROM users WHERE email=?', [email], function (err, results) {
        if (err) done(err);
        if (!results[0]) done(err);
        done(null, results[0]);
    });
});

passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(username, password, done) {
      var sql = "SELECT name, email FROM users WHERE email=? AND password=?";
      sqlConnection.query(sql,[username, password], function (error, results, fields) {
        if (error) throw error;
        if(results[0]){
          return done(null, results[0]);
        } else {
          return done(null, false, { message: '잘못된 로그인 정보입니다.' });
        }
      });
    }
  ));

app.get('/login', function(req,res){
    var fmsg = req.flash();
    res.render('login',{flash : fmsg});
});
  
app.post('/login', passport.authenticate('local', { //전략 = local
        successRedirect: '/main',  //성공시 홈 페이지
        failureRedirect: '/login', //실패시 로그인 페이지
        failureFlash: true
    })
);
  
app.get('/logout',function(req,res){
    req.logout();
    req.session.save(function(err){  
        res.redirect('/');
    });
});

//라우터
var indexRouter = require('./routes/index')
var signupRouter = require('./routes/signup')
var mainRouter= require('./routes/main')



app.use('/',indexRouter);
app.use('/signup',signupRouter);
app.use('/main',mainRouter);


app.listen(3000);