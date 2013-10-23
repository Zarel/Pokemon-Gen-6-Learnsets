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

var LearnsetsG6 = require('./learnsets-g6.js');
var Tools = require('./tools.js');

// A-C, D-I, J-R, S-O, P-Z

var keys = Object.keys(LearnsetsG6).sort();

var buf = '';
var curFile = 'a';
for (var i=0; i<keys.length; i++) {
	var key = keys[i];
	if (!key) continue;

	if (key.charAt(0) === 'd' && curFile === 'a') {
		fs.writeFileSync('learnsets-g6/learnsets-g6-A-to-C.txt', buf);
		buf = '';
		curFile = 'd';
	}
	if (key.charAt(0) === 'j' && curFile === 'd') {
		fs.writeFileSync('learnsets-g6/learnsets-g6-D-to-I.txt', buf);
		buf = '';
		curFile = 'j';
	}
	if (key.charAt(0) === 's' && curFile === 'j') {
		fs.writeFileSync('learnsets-g6/learnsets-g6-J-to-R.txt', buf);
		buf = '';
		curFile = 's';
	}
	if (key.charAt(0) === 'p' && curFile === 's') {
		fs.writeFileSync('learnsets-g6/learnsets-g6-S-to-O.txt', buf);
		buf = '';
		curFile = 'p';
	}

	buf += '== '+Tools.getTemplate(key).name+' ==\n\n';
	for (var j in LearnsetsG6[key].level) {
		buf += 'L? - '+Tools.getMove(LearnsetsG6[key].level[j]).name+'\n';
	}
	for (var j in LearnsetsG6[key].tm) {
		buf += 'TM - '+Tools.getMove(LearnsetsG6[key].tm[j]).name+'\n';
	}
	for (var j in LearnsetsG6[key].egg) {
		buf += 'Egg - '+Tools.getMove(LearnsetsG6[key].egg[j]).name+'\n';
	}
	buf += '\n';
}
fs.writeFileSync('learnsets-g6/learnsets-g6-P-to-Z.txt', buf);
