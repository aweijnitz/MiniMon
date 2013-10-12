var os = require('os-utils');
var RounderDB = require('rounderdb');
var http = require('http');
var util = require('util');
var fs = require('fs');

var selfMon = require('./lib/monitorSelf.js');
var router = require('./lib/router.js');

var config = require('./conf/default.conf');
var DBconf = {
    "persistenceConf": {
        "dbFile": "./db/rounderDB.json",
        "syncInterval": 5
    },
    "cpuUsage": [
        {
            "capacity": 60,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 600,
            "aggregationStrategy": "average"
        }
    ],
    "loadAvg": [
        {
            "capacity": 60,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 600,
            "aggregationStrategy": "average"
        }
    ],
    "selfMem": [
        {
            "capacity": 60,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 600,
            "aggregationStrategy": "average"
        }
    ],
    "freemem": [
        {
            "capacity": 60,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 600
        }
    ]
};

var port = 8000;
var db = null;

if (fs.existsSync(DBconf.persistenceConf.dbFile)) {
    console.log("CREATING FROM FILE: " + DBconf.persistenceConf.dbFile);
    var data = fs.readFileSync(DBconf.persistenceConf.dbFile);
    var obj = JSON.parse(data);
    db = RounderDB.loadInstance(obj);
} else
    db = RounderDB.createInstance(DBconf);

// Enable logging
var doLogging = false;
var dryrun = false; // if true, don't add anything to db (just print, if doLogging is enabled)

var intervalCPU = 1000;
var intervalLoadAvg = 1 * 60 * 1000;
var intervalMem = 1500;

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
    var freeMem = os.freememPercentage();
    log('Free mem (%): ' + freeMem);
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
var cpuHandle = setInterval(cpuMon, intervalCPU);
var cpuLoad = setInterval(loadAvg, intervalLoadAvg);
var memHandle = setInterval(memMon, intervalMem);
var selfMemHandle = setInterval(selfMem, intervalMem);

var shutdownHook = function(err) {
    var exitCode = 0;
    if(err) {
        console.err("ERROR. Couldn't save DB before shutting down. Cause: "+err);
        exitCode = 1;
    }
    process.exit(exitCode);
  };

// Configure graceful exits on SIGINT and SIGTERM
// 
process.on('SIGINT', function() {
  console.log('Got SIGINT.  Saving DB and shutting down');
  RounderDB.saveInstance(db, shutdownHook);
});

process.on('SIGTERM', function() {
  console.log('Got SIGTERM.  Saving DB and shutting down');
  RounderDB.saveInstance(db, shutdownHook);
});


// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
//    console.log("----- NEW REQEST!\n"+util.inspect(request));
    console.log("----- NEW REQEST! method: " + request.method + " URL: " + request.url);
    var result = router.dispatch(db, request.method, request.url);
    response.writeHead(result.status, {"Content-Type": "text/plain"});
    response.end(result.data);
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(port);

console.log("Server running at http://127.0.0.1:8000/");


var log = function (msg) {
    if (doLogging)
        console.log(msg);

}