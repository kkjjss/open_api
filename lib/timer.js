module.exports = {
    tranDtime:function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = ("0" + (1 + date.getMonth())).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
        var hour = ("0" + date.getHours()).slice(-2);
        var minuite = ("0" + date.getMinutes()).slice(-2);
        var second = ("0" + date.getSeconds()).slice(-2);
        return year+month+day+hour+minuite+second;
    },
    trandID:function() {
        var date = new Date();
        var hour = ("0" + date.getHours()).slice(-2);
        var minuite = ("0" + date.getMinutes()).slice(-2);
        var second = ("0" + date.getSeconds()).slice(-2);
        var millisecond = ("00" + date.getMilliseconds()).slice(-3);
        return hour+minuite+second+millisecond;
    },
    toDate:function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = ("0" + (1 + date.getMonth())).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
        return year+month+day;
    }
}