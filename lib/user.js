module.exports = {
    isLoggedIn:function(req) {
        if (req.user) {
            return true;
        } else {
            return false;
        }
    }
}