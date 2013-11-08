var fs = require('fs');
global.toId = function(text) {
        if (text && text.id) text = text.id;
        else if (text && text.userid) text = text.userid;

        return string(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
};
global.string = function(str) {
        if (typeof str === 'string' || typeof str === 'number') return ''+str;
        return '';
};

// build learnsetsG6

var LearnsetsG6 = {};

// If modern computers didn't come standard with 4GB of RAM,
// I'd probably stream this

var input = ''+fs.readFileSync('learnsets-g6/learnsets-g6-A-to-C.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-D-to-I.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-J-to-O.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-P-to-R.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-S-to-Z.txt');

input = input.split('\n');

for (var i=0; i<input.length; i++) {
	var line = input[i];
	line = line.trim();
	if (!line) continue;
	if (line.charAt(0) === '(') continue; // this is a comment
	if (line.charAt(0) === '=') {
		speciesid = toId(line);
		species = line;
		continue;
	}
	var parts = line.split(' - ');
	if (!parts[0] || !parts[1] || parts.length != 2) {
		console.error("Line '"+line+"' must be in the format 'Source - Move' for "+species);
		continue;
	}
	var moveid = toId(parts[1]);
	var typeString = parts[0].toLowerCase().replace(/ /g,'').replace('.','');

	var type = '';
	var level = '';
	if (typeString.substr(0,2) in {tm:1,hm:1}) type = '6M';
	else if (typeString === 'tutor') type = '6T';
	else if (typeString === 'egg') type = '6E';
	else if (typeString === 'moverelearner' || typeString === 'relearn' || typeString === 'mr' || typeString === 'l?' || typeString === '?') type = '6L0';
	else if (typeString === 'start') type = '6L1';
	else if (typeString.substr(0,1) === 'l') {
		level = typeString.substr(1);
	}
	if (!type && !level) level = typeString;
	if (level) {
		if (level.charAt(0) in {'<':1,'>':1,'?':1}) type = '6L0';
		else if (/^[0-9]{1,3}$/.test(level)) type = '6L'+(parseInt(level, 10)||1);
	}
	if (!type) console.error("Source '"+parts[0]+"' in '"+line+"' not formatted correctly for "+species);
	if (type) {
		if (!LearnsetsG6[speciesid]) LearnsetsG6[speciesid] = {learnset:{}};

		if (!LearnsetsG6[speciesid].learnset[moveid]) LearnsetsG6[speciesid].learnset[moveid] = [type];
		else LearnsetsG6[speciesid].learnset[moveid].push(type);
	}
}

console.log(JSON.stringify(LearnsetsG6));
