// import learnsets
// FROM: text in learnsets-g6
// TO: PS data/learnsets.js

require("sugar");
fs = require("fs");

var Tools = require('./tools.js');
var Learnsets = Tools.data.Learnsets;

// remove existing gen 6 data

for (var speciesid in Learnsets) {
	if (!Learnsets[speciesid] || !Learnsets[speciesid].learnset) continue;
	var learnset = Learnsets[speciesid].learnset;
	for (var moveid in learnset) {
		var sources = learnset[moveid];
		for (var i=sources.length-1; i>=0; i--) {
			if (sources[i].charAt(0) === '6') {
				sources.splice(i, 1);
			}
		}
		if (!sources.length) delete learnset[moveid];
	}
}

// build learnsetsG6

var LearnsetsG6 = {};
for (var speciesid in Learnsets) {
	LearnsetsG6[speciesid] = {learnset:{}};
	for (var moveid in Learnsets[speciesid].learnset) {
		LearnsetsG6[speciesid].learnset[moveid] = [];
	}
}

// If modern computers didn't come standard with 4GB of RAM,
// I'd probably stream this
var input = ''+fs.readFileSync('learnsets-g6/learnsets-g6-A-to-C.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-D-to-I.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-J-to-O.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-P-to-R.txt');
input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-S-to-Z.txt');

input = input.split('\n');

var speciesid = '';
var species = '';

var lastType = '';
var lastTypeCount = 0;
for (var i=0; i<input.length; i++) {
	var line = input[i];
	line = line.trim();
	if (!line) continue;
	if (line.charAt(0) === '(') continue; // this is a comment
	if (line.charAt(0) === '=') {
		speciesid = Tools.getTemplate(line).id;
		if (speciesid.substr(0,6) === 'deoxys') speciesid = 'deoxys';
		species = line;
		lastType = '';
		lastTypeCount = 0;
		continue;
	}
	var parts = line.split(' - ');
	if (!parts[0] || !parts[1] || parts.length != 2) {
		console.log("Line '"+line+"' must be in the format 'Source - Move' for "+species);
		continue;
	}
	var move = Tools.getMove(parts[1]);
	if (!move.exists) {
		console.log("Move '"+parts[1]+"' in '"+line+"' doesn't exist for "+species);
		continue;
	}
	var typeString = parts[0].toLowerCase().replace(/ /g,'').replace('.','');

	var type = '';
	var level = '';
	if (typeString.substr(0,2) in {tm:1,hm:1}) type = '6M';
	else if (typeString === 'tutor') type = '6T';
	else if (typeString === 'egg') type = '6E';
	else if (typeString === 'moverelearner' || typeString === 'relearn' || typeString === 'mr' || typeString === 'l?' || typeString === '?') type = '6L0';
	else if (typeString === 'start') type = '6L1';
	else if (typeString.substr(0,5) === 'event') {
		var eventNum = parseInt(typeString.substr(5), 10);
		if (!eventNum && typeString.substr(5) !== '0') console.log("Source '"+parts[0]+"' in '"+line+"' requires event number for "+species);
		type = '6S'+eventNum;
	}
	else if (typeString.substr(0,5) === 'level') {
		level = typeString.substr(5);
	}
	else if (typeString.substr(0,3) === 'lvl') {
		level = typeString.substr(3);
	}
	else if (typeString.substr(0,2) === 'lv') {
		level = typeString.substr(2);
	}
	else if (typeString.substr(0,1) === 'l') {
		level = typeString.substr(1);
	}
	if (!type && !level) level = typeString;
	if (level) {
		if (level.charAt(0) in {'<':1,'>':1,'?':1}) type = '6L0';
		else if (/^[0-9]{1,3}$/.test(level)) type = '6L'+(parseInt(level, 10)||1);
	}
	if (!type) console.log("Source '"+parts[0]+"' in '"+line+"' not formatted correctly for "+species);
	if (type) {
		if (!Learnsets[speciesid]) {
			if (Learnsets[speciesid] !== '') console.log("Pokemon '"+species+"' doesn't exist or shouldn't have a learnset.");
			Learnsets[speciesid] = '';
			continue;
		}
		if (type !== '6L1') {
			lastTypeCount = 0;
		} else if (lastType === type) {
			lastTypeCount++;
		} else {
			lastTypeCount = 0;
		}
		lastType = type;
		if (!Learnsets[speciesid].learnset[move.id]) Learnsets[speciesid].learnset[move.id] = [type];
		else if (Learnsets[speciesid].learnset[move.id].indexOf(type) < 0) Learnsets[speciesid].learnset[move.id].push(type);

		if (type.substr(0,2) === '6L') {
			type = '6L'+Number(type.substr(2)).pad(3);
			if (type === '6L001') type += String.fromCharCode(97+lastTypeCount);
		}
		if (!LearnsetsG6[speciesid].learnset[move.id]) LearnsetsG6[speciesid].learnset[move.id] = [type];
		else if (LearnsetsG6[speciesid].learnset[move.id].indexOf(type) < 0) LearnsetsG6[speciesid].learnset[move.id].push(type);
	}
}

// Fill out gen 5 level-up and TM data for fallback
// for (var speciesid in Learnsets) {
// 	if (!Tools.getTemplate(speciesid).isUnreleased) continue;
// 	var learnset = Learnsets[speciesid].learnset;
// 	for (var moveid in learnset) {
// 		if (LearnsetsG6[speciesid].learnset[moveid].length) continue;
// 		var sources = learnset[moveid];
// 		for (var i=sources.length-1; i>=0; i--) {
// 			if (sources[i].substr(0,2) === '5L') {
// 				LearnsetsG6[speciesid].learnset[moveid] = ['6L000'];
// 				Learnsets[speciesid].learnset[moveid].push('6L0');
// 			} else if ((sources[i] === '5M' && !(moveid in {allyswitch:1,telekinesis:1,workup:1,pluck:1})) || (sources[i] === '5T' && moveid in {roost:1, sleeptalk:1})) {
// 				LearnsetsG6[speciesid].learnset[moveid] = ['6M'];
// 				Learnsets[speciesid].learnset[moveid].push('6M');
// 			}
// 		}
// 	}
// }

var output = 'exports.BattleLearnsets = {\n';

for (var speciesid in Learnsets) {
	var learnset = Learnsets[speciesid].learnset;
	output += '	'+speciesid+':{learnset:{';
	output += Object.keys(learnset).map(function(key) {
		return (key==='return'?'"return"':key)+':'+JSON.stringify(learnset[key]);
	}).join(',');
	output += '}},\n';
}

output = output.substr(0, output.length-2)+'\n';

output += '};\n';

fs.writeFileSync('data/learnsets.js', output);


output = 'exports.BattleLearnsets = {\n';

for (var speciesid in LearnsetsG6) {
	var learnset = LearnsetsG6[speciesid].learnset;
	output += '	'+speciesid+':{learnset:{';
	output += Object.keys(learnset).map(function(key) {
		return (key==='return'?'"return"':key)+':'+JSON.stringify(learnset[key]);
	}).join(',');
	output += '}},\n';
}

output = output.substr(0, output.length-2)+'\n';

output += '};\n';

fs.writeFileSync('data/learnsets-g6.js', output);
