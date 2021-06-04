var express = require('express');
var router = express.Router();
var user = require('../lib/user');
var mysql = require('mysql');
var fs = require("fs");
var request = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

var DBoptions = JSON.parse(fs.readFileSync('./private/DBoptions.json'));
const sqlConnection = mysql.createConnection(DBoptions);
sqlConnection.connect();

var apikey = {};
var state = "12345678901234567890123456789012";
var defaultScope = "login inquiry transfer";

router.get("/",function(req, res){
    if(user.isLoggedIn(req)){
        res.redirect('/main')
    } else {
        var sql = "SELECT * FROM apikey";
        sqlConnection.query(sql, function (error, results, fields) {
            apikey = results[0];
            res.render("signup",{apikey : apikey, state : state, defaultScope : defaultScope});
        });
    }
})

router.get('/authResult',function(req, res){
    console.log(req.query);
    if(req.query.state==state){
        var code = req.query.code;
        var post = {
            method : "POST",
            url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
            header : {
                'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            form : {
                code : code,
                client_id : apikey.ClientID,
                client_secret : apikey.ClientSecret,
                redirect_uri : 'http://localhost:3000/signup/authResult',
                grant_type : 'authorization_code'
            }
        }

        request(post, function (err, response, body) {
            var result = JSON.parse(body);
            console.log(result)
            res.render('authResult',{data : result})
        });
    }
});

router.post("/",function(req,res){
    var userName = req.body.userName;
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var userAccessToken = req.body.userAccessToken;
    var userRefreshToken = req.body.userRefreshToken;
    var userTokenExpiresIn = req.body.userTokenExpiresIn;
    var userSeqNo = req.body.userSeqNo;

    var sql = "SELECT * FROM users WHERE email=?"
    sqlConnection.query(sql,[userEmail],function(error, results, fields){
        if(results[0]){
            res.json({result : "중복된 이메일 입니다."})
        } else {
            sql = "INSERT INTO users (name, email, password, accessToken, refreshToken, expires_in, seqNo, scope)" +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            sqlConnection.query(sql,[userName, userEmail, userPassword, userAccessToken, userRefreshToken, userTokenExpiresIn, userSeqNo, defaultScope], function (error2, results2, fields) {
                if (error2){
                    res.json({result : "에러"});
                }
                console.log(results2);
                res.json({result : "가입완료"});
            });
        }
    });
});

module.exports = router;