var fs = require("fs");
var Aliases = require("./data/aliases.js").BattleAliases;

function splitFirst(str, delim) {
	var delimIndex = str.indexOf(delim);
	if (delimIndex >= 0) {
		return [str.substr(0, delimIndex), str.substr(delimIndex + delim.length)];
	} else {
		return [str, ''];
	}
}
function getId(text, recursed) {
	if (recursed > 2) console.log('wtf '+text);
	if (text && text.id) text = text.id;
	else if (text && text.userid) text = text.userid;

	var id = String(text).toLowerCase().replace(/é/g, 'e').replace(/[^a-z0-9]+/g, '');
	if (Aliases[id]) return getId(Aliases[id], (recursed||0)+1); // if this is infinite recursion, someone messed up aliases
	return id;
};

console.log('read moves');

(function() {
	var POMoves = {};
	var data = String(fs.readFileSync('db/moves/moves.txt')).split('\n');
	for (var i=0; i<data.length; i++) {
		var line = splitFirst(data[i], ' ');
		if (!line) continue;
		POMoves[line[0]] = getId(line[1]);
	}

	fs.writeFileSync('po-moves.js', "module.exports = "+JSON.stringify(POMoves)+";\n");
})();

console.log('read pokes');

(function() {
	var POPokemon = {};
	var data = String(fs.readFileSync('db/pokes/pokemons.txt')).split('\n');
	for (var i=0; i<data.length; i++) {
		var line = splitFirst(data[i], ' ');
		if (!line) continue;
		if (line[0].substr(line[0].length-2) === ':H') {
			line[0] = line[0].substr(0, line[0].length-2);
		}
		POPokemon[line[0]] = getId(line[1]);
	}

	fs.writeFileSync('po-pokemon.js', "module.exports = "+JSON.stringify(POPokemon)+";\n");
})();
