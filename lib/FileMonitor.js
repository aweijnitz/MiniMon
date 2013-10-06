var path = require('path');

var CLM = require('./CommandLineMonitor.js');




/**
 * Monitor a file for changes, invoking callback in change.
 * @param fileName File to monitor. Will be resolved to an absolute path.
 * @param callback
 */
exports.fileChangeMonitor = function(fileName, callback) {
    var absolutePath = path.resolve(fileName);
    watcher = fs.watch(absolutePath);
    watcher.on('change', callback);
    watcher.on('error', function () {
        watcher.close();
    });
};


/** Watch a file for changes and invoke the callback with the last line of the file on change.
 * Only works on *nix systems, as it uses 'tail' to get the last line.
 *
 * @param fileName
 * @param callback Will be invoked with the the result of "tail -1" on the file
 */
exports.tailFileMonitor = function(fileName, callback) {
    var absolutePath = path.resolve(fileName);
    watcher = fs.watch(absolutePath);
    watcher.on('change', tailFile(absolutePath, callback));
    watcher.on('error', function () {
        watcher.close();
    });
};

var tailFile = function(fileName, callback) {
    return CLM.makeCLIMonitor("tail -1 "+fileName, function(error, stdout, stderr) {
        if(!error)
            callback(stdout);
    })
};