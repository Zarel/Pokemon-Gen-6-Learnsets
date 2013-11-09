var Tools = require('./tools');
var fs = require("fs");

var index = [];

index = index.concat(Object.keys(Tools.data.Pokedex).map(function(x){return x+' pokemon'}))
index = index.concat(Object.keys(Tools.data.Movedex).map(function(x){return x+' move'}))
index = index.concat(Object.keys(Tools.data.Items).map(function(x){return x+' item'}))
index = index.concat(Object.keys(Tools.data.Abilities).map(function(x){return x+' ability'}))
index = index.concat(Object.keys(Tools.data.TypeChart).map(function(x){return toId(x)+' type'}))
index = index.concat(['physical', 'special', 'status'].map(function(x){return toId(x)+' category'}))

index.sort();

BattleSearchIndex = index.map(function(x){return x.split(' ')[0]});
BattleSearchIndexType = index.map(function(x){return x.split(' ')[1]});

BattleSearchIndexOffset = BattleSearchIndex.map(function(id, i){
	var name='';
	switch (BattleSearchIndexType[i]) {
	case 'pokemon':
		var name = Tools.getTemplate(id).species;
		break;
	case 'move':
		var name = Tools.getMove(id).name;
		break;
	case 'item':
		var name = Tools.getItem(id).name;
		break;
	case 'ability':
		var name = Tools.getAbility(id).name;
		break;
	}
	var res = '';
	var nonAlnum = 0;
	for (var i=0,j=0; i<id.length; i++,j++) {
		while (!/[a-zA-Z0-9]/.test(name[j])) {
			j++;
			nonAlnum++;
		}
		res += nonAlnum;
	}
	if (nonAlnum) return res;
	return '';
});

BattleSearchCountIndex = {};
for (var type in Tools.data.TypeChart) {
	BattleSearchCountIndex[type+' move'] = Object.keys(Tools.data.Movedex).filter(function(id){ if (Tools.data.Movedex[id].type === type) return true; }).length;
}

for (var type in Tools.data.TypeChart) {
	BattleSearchCountIndex[type+' pokemon'] = Object.keys(Tools.data.Pokedex).filter(function(id){ if (Tools.data.Pokedex[id].types.indexOf(type) >= 0) return true; }).length;
}

var buf = '// automatically built with cache-index.js in the Gen 6 Learnsets repository\n\n';

buf += 'exports.BattleSearchIndex = '+JSON.stringify(BattleSearchIndex)+';\n\n';

buf += 'exports.BattleSearchIndexType = '+JSON.stringify(BattleSearchIndexType)+';\n\n';

buf += 'exports.BattleSearchIndexOffset = '+JSON.stringify(BattleSearchIndexOffset)+';\n\n';

buf += 'exports.BattleSearchCountIndex = '+JSON.stringify(BattleSearchCountIndex)+';\n';

fs.writeFileSync('data/search-index.js', buf);

console.log("Done.");
