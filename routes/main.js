var express = require('express');
var user = require('../lib/user');
var router = express.Router();
var mysql = require('mysql');
var fs = require("fs");
var request = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

var DBoptions = JSON.parse(fs.readFileSync('./private/DBoptions.json'));
const sqlConnection = mysql.createConnection(DBoptions);
sqlConnection.connect();

router.get('/',function(req, res){
    if(!user.isLoggedIn(req)){
        res.redirect('/')
    } else {
        var sql = "SELECT accessToken, seqNo FROM users WHERE name=? AND email=?";
        sqlConnection.query(sql,[req.user.name, req.user.email], function (error, results, fields) {
            if (error) throw error;
            console.log("GET access token, seqNo from DB",results[0])
            var accessToken = results[0].accessToken;
            var seqNo = results[0].seqNo;

            var get = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/user/me",
                headers : {
                    'Authorization' : 'Bearer ' + accessToken
                },
                qs : {
                    user_seq_no : seqNo
                }
            }

            request(get, function(err,response,body){
                var result = JSON.parse(body);
                console.log(result)
                res.render('main',{user : req.user, userInfo : result.res_list})
            })
        }); 
    }
})

module.exports = router;