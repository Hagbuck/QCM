/**
 * Polytech QCM
 * logger.js
 */


module.exports = {
    /**
     * Colors
     */
    Reset      : "\x1b[0m",
    Bright     : "\x1b[1m",
    Dim        : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink      : "\x1b[5m",
    Reverse    : "\x1b[7m",
    Hidden     : "\x1b[8m",
    FgBlack    : "\x1b[30m",
    FgRed      : "\x1b[31m",
    FgGreen    : "\x1b[32m",
    FgYellow   : "\x1b[33m",
    FgBlue     : "\x1b[34m",
    FgMagenta  : "\x1b[35m",
    FgCyan     : "\x1b[36m",
    FgWhite    : "\x1b[37m",
    BgBlack    : "\x1b[40m",
    BgRed      : "\x1b[41m",
    BgGreen    : "\x1b[42m",
    BgYellow   : "\x1b[43m",
    BgBlue     : "\x1b[44m",
    BgMagenta  : "\x1b[45m",
    BgCyan     : "\x1b[46m",
    BgWhite    : "\x1b[47m",

    /**
     * Create a simply logger
     */
    info_lvl    : true,
    debug_lvl   : true,
    error_lvl   : true,

    info: function(str){
        if(this.info_lvl)
            console.log(this.Bright + this.FgGreen + '[INFO]\t ' + str + this.Reset);
    },
    debug: function(str){
        if(this.debug_lvl)
            console.log(this.Bright + this.FgCyan + '[DEBUG]\t ' + str + this.Reset);
    },
    error: function(str){
        if(this.error_lvl)
            console.error(this.Bright + this.FgRed + '[ERROR]\t ' + str + this.Reset);
    }
};