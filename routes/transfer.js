var express = require('express');
var user = require('../lib/user');
var timer = require('../lib/timer')
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
        res.redirect('/');
    } else {
      res.render('transfer',{user : req.user, qs : req.query});
    }
});

router.post('/',function(req,res){
    var recv_client_bank_code = req.body.recv_client_bank_code;
    var recv_client_account_num = req.body.recv_client_account_num;
    var tran_amt = req.body.tran_amt;
    var fintech_use_num = req.body.fintech_use_num;
    console.log(fintech_use_num);

    var sql = "SELECT id, accessToken FROM users WHERE name=? AND email=?";
    sqlConnection.query(sql,[req.user.name, req.user.email], function (error, results, fields) {
        if (error) throw error;
        var accessToken = results[0].accessToken;
        var id = results[0].id;
        var tran_dtime = timer.tranDtime();
        var tran_id = timer.trandID();

        var post = {
            method : "POST",
            url : " https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
            headers : {
                'Authorization' : 'Bearer ' + accessToken,
                'Content-Type' : 'application/json; charset=UTF-8'
            },
            json : {
                bank_tran_id : "M202112214" + "U" + tran_id,
                cntr_account_type : "N",
                cntr_account_num : '1111222233334444',
                dps_print_content : '송금',
                fintech_use_num : fintech_use_num,
                wd_print_content : '송금',
                tran_amt : tran_amt,
                tran_dtime : tran_dtime,
                req_client_name : '강진석',
                req_client_bank_code : '002',
                req_client_account_num : '1111111111111111',
                req_client_num : id,
                transfer_purpose : 'TR',
                recv_client_name : '강진석',
                recv_client_bank_code : recv_client_bank_code,
                recv_client_account_num : recv_client_account_num
            }
        }

        request(post, function(err,response,body){
            console.log(response.body);
            res.json({result : response.body});
        });
    });
});

module.exports = router;