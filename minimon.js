var http = require('http');
var util = require('util');
var fs = require('fs');
var os = require('os-utils');
var RounderDB = require('rounderdb');
var selfMon = require('./lib/monitorSelf.js');
var router = require('./lib/router.js');

var conf = require('./conf/default.conf.js');
var DBconf = conf.DBconf;
var sampleInterval = conf.sampleInterval;

var doLogging = false;
var dryrun = false; // if true, don't add anything to db (just print, if doLogging is enabled)
var db = null;

if (fs.existsSync(DBconf.persistenceConf.dbFile)) {
    console.log("CREATING FROM FILE: " + DBconf.persistenceConf.dbFile);
    var data = fs.readFileSync(DBconf.persistenceConf.dbFile);
    var obj = JSON.parse(data);
    db = RounderDB.loadInstance(obj);
} else
    db = RounderDB.createInstance(DBconf);


var addToDB = function (key, value) {
    if (!dryrun)
        db.add(key, value);
}

var cpuMon = function () {
    os.cpuUsage(function (v) {
        log('CPU Usage (%): ' + v);
        addToDB('cpuUsage', v);
    });
};

var memMon = function () {
    var freeMem = os.freemem();
    log('Free mem (MB): ' + freeMem);
    addToDB('freemem', freeMem);
};

var selfMem = function () {
    var freeMem = selfMon.RAMUsed();
    log('Process mem (MB): ' + freeMem);
    addToDB('selfMem', freeMem);
};


var loadAvg = function () {
    var load = os.loadavg(1);
    log('Load Avg. : ' + load);
    addToDB('loadAvg', load);
};


// Register data collectors
//
var cpuHandle = setInterval(cpuMon, sampleInterval.cpuUsage);
var cpuLoad = setInterval(loadAvg, sampleInterval.loadAvg);
var memHandle = setInterval(memMon, sampleInterval.mem);
var selfMemHandle = setInterval(selfMem, sampleInterval.mem);


// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
//    console.log("----- NEW REQEST!\n"+util.inspect(request));
    console.log("----- NEW REQEST! method: " + request.method + " URL: " + request.url);
    var result = router.dispatch(db, request.method, request.url);
    response.writeHead(result.status, {"Content-Type": "text/plain"});
    response.end(result.data);
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(conf.port);

console.log("Server running at http://127.0.0.1:"+conf.port);




var log = function (msg) {
    if (doLogging)
        console.log(msg);

}