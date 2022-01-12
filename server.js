'use strict';

var mobiwork = require("./mobiwork.js");
var server = new mobiwork({
    name: "learnED",
    port: "1565",
    mongodb: "21565"
});

server.run(); 