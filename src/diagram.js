(function () {
	"use strict";
	/*global grammar */

	function Diagram() {
		this.title   = undefined;
		this.actors  = [];
		this.signals = [];
	}

	Diagram.prototype.getActor = function(name) {
		var i;
		var actors = this.actors;
		for (i in actors) {
			if (actors[i].name == name)
				return actors[i];
		}
		i = actors.push( new Diagram.Actor(name, actors.length) );
		return actors[ i - 1 ];
	};

	Diagram.prototype.setTitle = function(title) {
		this.title = title;
	};

	Diagram.prototype.addSignal = function(signal) {
		this.signals.push( signal );
	};

	Diagram.Actor = function(name, index) {
		this.name = name;
		this.index = index;
	};

	Diagram.Signal = function(actorA, signaltype, actorB, message) {
		this.type       = "Signal";
		this.actorA     = actorA;
		this.actorB     = actorB;
		this.linetype   = signaltype;
		this.arrowtype  = signaltype >> 2;
		this.message    = message;
	};

	Diagram.Note = function(actor, placement, message) {
		this.type      = "Note";
		this.actor     = actor;
		this.placement = placement;
		this.message   = message;
	};

	Diagram.LINETYPE = {
		SOLID  : 0,
		DOTTED : 1
	};

	Diagram.ARROWTYPE = {
		FILLED  : 0,
		OPEN    : 1
	};

	Diagram.PLACEMENT = {
		LEFTOF  : 0,
		RIGHTOF : 1,
		OVER    : 2
	};

	/** include the grammar.js for the bundle */
	/*> ../grammar.js */

	/**
	 * jison doesn't have a good exception, so we make one
	 */
	function ParseError(message, hash) {
		this.name = "ParseError";
		this.message = (message || "");
		this.text  = hash.text;
		this.token = hash.token;
		this.line  = hash.line;
		this.loc   = hash.loc;
		this.expected = hash.expected;
	}
	ParseError.prototype = new Error();
	Diagram.ParseError = ParseError;

	grammar.parseError = function(message, hash) {
		throw new ParseError(message, hash);
	};

	Diagram.parse = function(input) {	
		//var parser = require("grammar").parser;
		grammar.yy = new Diagram();

		return grammar.parse(input);
	};

	// Expose this class externally
	this.Diagram = Diagram;

}).call(this);