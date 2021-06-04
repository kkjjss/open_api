var express = require('express');
var timer = require('../lib/timer');
var router = express.Router();
var mysql = require('mysql');
var fs = require("fs");
var request = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

var DBoptions = JSON.parse(fs.readFileSync('./private/DBoptions.json'));
const sqlConnection = mysql.createConnection(DBoptions);
sqlConnection.connect();

router.post('*',function(req, res){
    var fintech_use_num = req.body.fintech_use_num;

    var sql = "SELECT accessToken FROM users WHERE name=? AND email=?";
    sqlConnection.query(sql,[req.user.name, req.user.email], function (error, results, fields) {
        if (error) throw error;
        var accessToken = results[0].accessToken;
        var tran_dtime = timer.tranDtime();
        var tran_id = timer.trandID();

        var get = {
            method : "GET",
            url : "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
            headers : {
                'Authorization' : 'Bearer ' + accessToken
            },
            qs : {
                bank_tran_id : "M202112214" + "U" + tran_id,
                fintech_use_num : fintech_use_num,
                tran_dtime : tran_dtime
            }
        }

        request(get, function(err,response,body){
            var result = JSON.parse(body);
            res.json({result : result});
        })
    });
})

module.exports = router;