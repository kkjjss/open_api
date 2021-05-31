var express = require('express');
var user = require('../lib/user');
var router = express.Router();

router.get('/',function(req, res){
    if(!user.isLoggedIn(req)){
        res.redirect('/')
    } else {
        res.render('main',{user:req.user});
    }
})

module.exports = router;