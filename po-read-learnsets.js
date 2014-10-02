var fs = require("fs");

var POMoves = require('./po-moves.js');
var POPokemon = require('./po-pokemon.js');

console.log('read level-up moves');

var LearnsetsG6 = {};

(function() {
	var data = String(fs.readFileSync('db/pokes/6G/level_moves.txt')).split('\n');
	for (var i=0; i<data.length; i++) {
		var line = data[i].split(' ');
		if (!line) continue;
		var speciesid = POPokemon[line[0]];
		if (!LearnsetsG6[speciesid]) LearnsetsG6[speciesid] = {};
		LearnsetsG6[speciesid].level = line.slice(1).map(function(k){return POMoves[k]});
	}
})();

console.log('read egg moves');

(function() {
	var data = String(fs.readFileSync('db/pokes/6G/egg_moves.txt')).split('\n');
	for (var i=0; i<data.length; i++) {
		var line = data[i].split(' ');
		if (!line) continue;
		var speciesid = POPokemon[line[0]];
		if (!LearnsetsG6[speciesid]) LearnsetsG6[speciesid] = {};
		LearnsetsG6[speciesid].egg = line.slice(1).map(function(k){return POMoves[k]});
	}
})();

console.log('read tm moves');

(function() {
	var data = String(fs.readFileSync('db/pokes/6G/tm_and_hm_moves.txt')).split('\n');
	for (var i=0; i<data.length; i++) {
		var line = data[i].split(' ');
		if (!line) continue;
		var speciesid = POPokemon[line[0]];
		if (!LearnsetsG6[speciesid]) LearnsetsG6[speciesid] = {};
		LearnsetsG6[speciesid].tm = line.slice(1).map(function(k){return POMoves[k]});
	}
})();

fs.writeFileSync('learnsets-g6.js', "module.exports = "+JSON.stringify(LearnsetsG6)+";\n");
