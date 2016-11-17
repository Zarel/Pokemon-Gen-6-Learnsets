// import learnsets
// FROM: text in learnsets.txt
// TO: PS data/learnsets.js

fs = require("fs");

var Tools = require('./tools.js').includeData();
var Learnsets = Tools.data.Learnsets;

// remove existing gen 7 data

for (var speciesid in Learnsets) {
	if (!Learnsets[speciesid] || !Learnsets[speciesid].learnset) continue;
	var learnset = Learnsets[speciesid].learnset;
	for (var moveid in learnset) {
		var sources = learnset[moveid];
		for (var i=sources.length-1; i>=0; i--) {
			if (sources[i].charAt(0) === '7') {
				sources.splice(i, 1);
			}
		}
		if (!sources.length) delete learnset[moveid];
	}
}

// build learnsetsG7

var LearnsetsG7 = {};
for (var speciesid in Learnsets) {
	LearnsetsG7[speciesid] = {learnset:{}};
	for (var moveid in Learnsets[speciesid].learnset) {
		LearnsetsG7[speciesid].learnset[moveid] = [];
	}
}

// If modern computers didn't come standard with 4GB of RAM,
// I'd probably stream this
var input = ''+fs.readFileSync('learnsets.txt');
// input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-D-to-I.txt');
// input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-J-to-O.txt');
// input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-P-to-R.txt');
// input += ''+fs.readFileSync('learnsets-g6/learnsets-g6-S-to-Z.txt');

input = input.split('\n');

var speciesid = '';
var species = '';

var lastType = '';
var lastTypeCount = 0;
var skipping = false;
for (var i=0; i<input.length; i++) {
	var line = input[i];
	line = line.trim();
	if (!line) continue;
	if (line.charAt(0) === '(') continue; // this is a comment
	if (line.charAt(0) === '=') {
		skipping = false;
		species = line.slice(3, -3);
		speciesid = Tools.getTemplate(species).id;
		if (species.startsWith('[Rotom]')) speciesid = speciesid.slice(0, -5);
		if (species.startsWith('[Kyurem]')) speciesid = speciesid.slice(0, -6);
		if (speciesid !== 'castform' && speciesid.endsWith('form')) speciesid = speciesid.slice(0, -4);
		if (speciesid.endsWith('forme')) speciesid = speciesid.slice(0, -5);
		if (species.endsWith('] 1')) speciesid = speciesid.slice(0, -1);
		if (species.endsWith('] 2')) speciesid = speciesid.slice(0, -1);
		if (species.endsWith('] 3')) speciesid = speciesid.slice(0, -1);
		if (speciesid.substr(0,6) === 'deoxys') speciesid = 'deoxys';
		if (species.includes('] Mega ') || species.includes('] Primal') || species.endsWith(' Trim') ||
			species.startsWith('[Zygarde]') || species.startsWith('[Castform]') || species.startsWith('[Pumpkaboo]') || species.startsWith('[Gourgeist]') || species.startsWith('[Shellos]') || species.startsWith('[Aegislash]') || species.startsWith('[Darmanitan]') || species.startsWith('[Keldeo]') || species.endsWith('] Therian Forme') || species.endsWith(' Flower') || species.includes('] Pirouette') || species.endsWith('] Original Color') || species.endsWith('] Hoopa') || species.startsWith('[Oricorio]') || species.startsWith('[Mimikyu]') || species.startsWith('[Wishiwashi]') || species.startsWith('[Basculin]') || species.startsWith('[Giratina]') || species.startsWith('[Shaymin]') || species.startsWith('[Cherrim]') || species.startsWith('[Hoopa]') || species.startsWith('[Pikachu]') || species.startsWith('[Minior]') || species.startsWith('[Greninja]')) {
			skipping = true;
			continue;
		}
		lastType = '';
		lastTypeCount = 0;
		continue;
	}
	if (skipping) continue;
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
	if (typeString.substr(0,2) in {tm:1,hm:1}) type = '7M';
	else if (typeString === 'tutor') type = '7T';
	else if (typeString === 'egg') type = '7E';
	else if (typeString === 'moverelearner' || typeString === 'relearn' || typeString === 'mr' || typeString === 'l?' || typeString === '?') type = '7L0';
	else if (typeString === 'start') type = '7L1';
	else if (typeString.substr(0,5) === 'event') {
		var eventNum = parseInt(typeString.substr(5), 10);
		if (!eventNum && typeString.substr(5) !== '0') console.log("Source '"+parts[0]+"' in '"+line+"' requires event number for "+species);
		type = '7S'+eventNum;
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
		if (level.charAt(0) in {'<':1,'>':1,'?':1}) type = '7L0';
		else if (/^[0-9]{1,3}$/.test(level)) type = '7L'+(parseInt(level, 10)||1);
	}
	if (!type) console.log("Source '"+parts[0]+"' in '"+line+"' not formatted correctly for "+species);
	if (type) {
		if (!Learnsets[speciesid]) {
			if (Learnsets[speciesid] !== '') {
				if (!Tools.getTemplate(speciesid).exists) {
					console.log("Pokemon '"+species+"' doesn't exist.");
				} else {
					console.log("Pokemon '"+species+"' shouldn't have a learnset.");
				}
			}
			Learnsets[speciesid] = '';
			continue;
		}
		if (type !== '7L1') {
			lastTypeCount = 0;
		} else if (lastType === type) {
			lastTypeCount++;
		} else {
			lastTypeCount = 0;
		}
		lastType = type;
		if (!Learnsets[speciesid].learnset[move.id]) Learnsets[speciesid].learnset[move.id] = [type];
		else if (Learnsets[speciesid].learnset[move.id].indexOf(type) < 0) Learnsets[speciesid].learnset[move.id].unshift(type);

		let mlset = Learnsets[speciesid].learnset[move.id];
		if (mlset.length >= 2 && mlset[0].slice(0, 2) === '7E' && mlset[1].slice(0, 1) === '7') {
			let i7 = 0;
			while (mlset[i7] && mlset[i7].charAt(0) === '7') i7++;
			mlset.splice(i7, 0, mlset[0]);
			mlset.shift();
		}

		if (type.substr(0,2) === '7L') {
			type = '7L'+String(type.substr(2)).padStart(3, '0');
			if (type === '7L001') type += String.fromCharCode(97+lastTypeCount);
		}
		if (!LearnsetsG7[speciesid].learnset[move.id]) LearnsetsG7[speciesid].learnset[move.id] = [type];
		else if (LearnsetsG7[speciesid].learnset[move.id].indexOf(type) < 0) LearnsetsG7[speciesid].learnset[move.id].push(type);
	}
}

var output = '\'use strict\';\n\nexports.BattleLearnsets = {\n';

for (var speciesid in Learnsets) {
	var learnset = Learnsets[speciesid].learnset;
	output += '\t'+speciesid+': {learnset: {\n';
	output += Object.keys(learnset).map(function(key) {
		return '\t\t'+key+': ["'+learnset[key].join('", "')+'"],\n';
	}).join('');
	output += '\t}},\n';
}

output += '};\n';

fs.writeFileSync('data/learnsets.js', output);
console.log('Writing learnsets... DONE');


output = 'exports.BattleLearnsets = {\n';

for (var speciesid in LearnsetsG7) {
	var learnset = LearnsetsG7[speciesid].learnset;
	output += '	'+speciesid+':{learnset:{';
	output += Object.keys(learnset).map(function(key) {
		return (key==='return'?'"return"':key)+':'+JSON.stringify(learnset[key]);
	}).join(',');
	output += '}},\n';
}

output = output.substr(0, output.length-2)+'\n';

output += '};\n';

fs.writeFileSync('data/learnsets-g7.js', output);
console.log('Writing learnsets-g7... DONE');
