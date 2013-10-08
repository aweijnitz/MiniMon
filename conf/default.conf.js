// Main configuration file
//
//

// Note for DB data size in memory
// Javascript Number is 64bit (doubleprecision 64-bit format IEEE 754)
// See http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
//
// Each entry will be to numbers [<val>, <timestamp>] -> 128/8 = 16 bytes
//
// ___ EXAMPLE CALCULATION
// CPU Sampling every second:
// 10min -> 10min*60s = 600 slots in first bucket, to keep 10min data in second resolution
// 7*24h = 7days*24h*(60min/10min) = 1008 slots in second bucket to keep data for a week in 10min resolution
// Estimated mem total for archive: 600 + 432 = 1608*16 = 25728 bytes = 25KB

// Listen port
var port = 8000;

// CPU Sampling every second -> 1st bucket: 600, 2nd bucket: 1008
var intervalCPU = 1000;

// Server load factor every minute:
// 10min -> 10 slots in first bucket
// 7*24h = 7*24*(60/10) = 1008 slots in second bucket
var intervalLoadAvg = 60 * 1000;

// Memory every 5 seconds:
// 10min -> 10*(60/5) -> 120 slots in first bucket
// 7*24h = 7*24*(60/10) = 1008 slots in second bucket
var intervalMem = 5000;

var sampleInterval = {
    cpuUsage: intervalCPU,
    loadAvg: intervalLoadAvg,
    mem: intervalMem
};

var DBconf = {
    "persistenceConf": {
        "dbFile": "./db/rounderDB.json",
        "syncInterval": 10*60
    },
    "cpuUsage": [
        {
            "capacity": 600,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 1008,
            "aggregationStrategy": "average"
        }
    ],
    "loadAvg": [
        {
            "capacity": 10,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 1008,
            "aggregationStrategy": "average"
        }
    ],
    "selfMem": [
        {
            "capacity": 120,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 1008,
            "aggregationStrategy": "average"
        }
    ],
    "freemem": [
        {
            "capacity": 120,
            "aggregationStrategy": "average"
        },
        {
            "capacity": 1008
        }
    ]
};

exports.port = port;
exports.DBconf = DBconf;
exports.sampleInterval = sampleInterval;