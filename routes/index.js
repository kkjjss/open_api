var express = require('express');
var user = require('../lib/user');
var router = express.Router();

router.get("/",function(req, res, next){
    if(user.isLoggedIn(req)){
        res.redirect('/main')
    } else {
        res.render("index",{});
    }
})

module.exports = router;