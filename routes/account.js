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
        res.render(`account`,{user : req.user, qs : req.query});
    }
});

router.post('/',function(req, res){
    var fintech_use_num = req.body.fintech_use_num;

    var sql = "SELECT accessToken FROM users WHERE name=? AND email=?";
    sqlConnection.query(sql,[req.user.name, req.user.email], function (error, results, fields) {
        if (error) throw error;
        var accessToken = results[0].accessToken;
        var tran_dtime = timer.tranDtime();
        var to_date = timer.toDate();
        var tran_id = timer.trandID();

        var get = {
            method : "GET",
            url : "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
            headers : {
                'Authorization' : 'Bearer ' + accessToken
            },
            qs : {
                bank_tran_id : "M202112214" + "U" + tran_id,
                fintech_use_num : fintech_use_num,
                inquiry_type : 'A',
                inquiry_base : 'D',
                from_date : '20190101',
                to_date : to_date,
                sort_order : 'D',
                tran_dtime : tran_dtime
            }
        }

        request(get, function(err,response,body){
            var result = JSON.parse(body);
            if(result.rsp_code=='A0000'){
                var transaction_list = result.res_list;

                var transaction_list_toHTML = '';
                for(var i = 0; i<transaction_list.length; i++){
                    transaction_list_toHTML += `
                    <li>
                        ${transaction_list[i].inout_type} : ${transaction_list[i].tran_amt}원<br>
                        거래 일시 : ${transaction_list[i].tran_date}<br>
                        잔액 : ${transaction_list[i].after_balance_amt}
                    </li>
                    `;
                }

                res.json({result : "success", transaction_list : transaction_list_toHTML});
            } else {
                res.json({result : "failure"})
            }
            
        });
    });
})

module.exports = router;