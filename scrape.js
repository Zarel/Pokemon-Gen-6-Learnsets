// based on http://anismiles.wordpress.com/2010/11/29/node-js-and-jquery-to-scrape-websites/

// External Modules
var request = require('ahr2'), // Abstract-HTTP-request https://github.com/coolaj86/abstract-http-request
sys = require('sys'),	   // System
events = require('events'), // EventEmitter
jsdom = require('jsdom');   // JsDom https://github.com/tmpvar/jsdom

var jQueryPath = 'http://code.jquery.com/jquery-2.0.3.min.js';
// var headers = {'content-type':'application/json', 'accept': 'application/json'};
var headers = {};

// Export searcher
module.exports = Searcher;

function Searcher(param) {
	if (param.headers) {
		this.headers = param.headers;
	} else {
		this.headers = headers;
	}

	if (param.getSearchUrl) this.getSearchUrl = param.getSearchUrl;
	if (param.parseHTML) this.parseHTML = param.parseHTML;
	this.id = param.id;
}

// Inherit from EventEmitter
Searcher.prototype = new process.EventEmitter;

Searcher.prototype.search = function(query, collector) {
	var self = this;
	var url = self.getSearchUrl(query);

	console.log('Connecting to... ' + url);

	request({
		href: url,
		method: 'GET',
		headers: self.headers,
		timeout: 10000
	}).when(function(err, response, html) {
		if (err) {
			console.log('Failed to fetch content with error: ' + err);
			self.onError({error: err, searcher: self});
			self.onComplete({searcher: self});
		} else {
			console.log('Fetched content from... ' + url);
			// create DOM window from HTML data
			var window = jsdom.jsdom(html).createWindow();
			// load jquery with DOM window and call the parser!
			jsdom.jQueryify(window, jQueryPath, function() {
				self.parseHTML(window);
				self.onComplete({searcher: self});
				process.exit();
			});
		}
	});
}

// Implemented in inhetired class
Searcher.prototype.getSearchUrl = function(query) {
	throw "getSearchUrl() is unimplemented!";
}
// Implemented in inhetired class
Searcher.prototype.parseHTML = function(window) {
	throw "parseHTML() is unimplemented!";
}
// Emits 'item' events when an item is found.
Searcher.prototype.onItem = function(item) {
	this.emit('item', item);
}
// Emits 'complete' event when searcher is done
Searcher.prototype.onComplete = function(searcher) {
	this.emit('complete', searcher);
}
// Emit 'error' events
Searcher.prototype.onError = function(error) {
	this.emit('error', error);
}

Searcher.prototype.toString = function() {
	return this.id;
}
