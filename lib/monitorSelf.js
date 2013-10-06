/**
 * Collect metrics about own process (monitor self)
 */

/** Returns physical RAM usage in MB of the executing Node process
 *
 */
exports.RAMUsed = function() {
    return process.memoryUsage().rss/(1024*1024);
}
