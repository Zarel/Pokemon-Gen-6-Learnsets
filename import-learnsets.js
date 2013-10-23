// import learnsets

toId = function(text) {
        if (text && text.id) text = text.id;
        else if (text && text.userid) text = text.userid;

        return string(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
};
string = function(str) {
        if (typeof str === 'string' || typeof str === 'number') return ''+str;
        return '';
}
require("sugar");
fs = require("fs");
fs.exists = require("path").exists;
fs.existsSync = require("path").existsSync;

var Tools = require('./tools.js');

var input = ''+fs.readFileSync('')