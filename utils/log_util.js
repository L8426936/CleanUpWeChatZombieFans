module.exports = (() => {
    Date.prototype.format = function() {
        return (new Date(this.getTime() - this.getTimezoneOffset() * 60000)).toISOString().replace(/T|Z/g, ' ');    
    }
    files.ensureDir("logs/");
    let running_config = JSON.parse(files.read("config/running_config.json"));
    let date = new Date();

    function log(int_level, text_level, message) {
        if (int_level >= running_config["log_level"]) {
            files.append("logs/log.log", date.format() + "[" + text_level + "] - " + message + "\n");
            if (console[text_level]) {
                console[text_level](message);
            } else {
                console.log(message);
            }
        }
    }

    function fatal(message) {
        log(5, "fatal", message);
    }

    function error(message) {
        log(4, "error", message);
    }

    function warn(message) {
        log(3, "warn", message);
    }

    function info(message) {
        log(2, "info", message);
    }

    function debug(message) {
        log(1, "debug", message);
    }

    function trace(message) {
        log(0, "trace", message);
    }

    return {
        fatal: fatal,
        error: error,
        warn: warn,
        info: info,
        debug: debug,
        trace: trace
    };
})();