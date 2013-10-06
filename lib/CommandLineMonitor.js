var exec = require('child_process').exec;




/** Make function that executes command and invokes callback with result.
 * Callback will be invoked be passed (error, stdout, stderr)
 * @param command
 * @param callback
 * @param timeout timeout in ms
 * @returns {Function}
 */
exports.makeCLIMonitor = function (command, callback, timeout) {

    timeout = timeout || 2000;

    return function () {
        var child = exec(command,{timeout: timeout}, callback);
        return child;
    }
}