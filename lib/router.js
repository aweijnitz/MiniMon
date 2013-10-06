var http = require('http');
var RounderDB = require('rounderdb');

var parseKey = function (url) {
    if (url)
        return url.substring(1); // Could probably be more refined...
    else
        return "";
};


var doGET = function (db, url) {
    var key = parseKey(url);
    var result = [];
    if (!db.getArchive(key)) {
        return { 'status': 404, 'data': "404 " + http.STATUS_CODES[404] + " - " + key + "\n"};
    }
    for (var i = 0; i < db.getArchive(key).getNrBuckets(); i++) {
        var bucket = {};
        bucket.name = key + "_" + i;
        var arr = db.getArchive(key).getDataForBucket(i);
        bucket.data = arr.map(function (i, e) {
            var o = {};
            o.x = i[0];
            o.y = i[1];
            return o;
        });
        result.push(bucket);
    }
    var data = JSON.stringify(result);
    result = {status: 200, data: data};
    //console.log(result);
    return result;
};


var dispatch = function (db, method, url) {

    if (method === "GET") {
        return doGET(db, url);
    } else
        return { 'status': 501, 'data': http.STATUS_CODES[501] }; // return 501 Not Implemented
};

exports.dispatch = dispatch;