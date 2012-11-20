(function () {
	"use strict";

	function Diagram() {
		this.actors  = [];
		this.signals = [];
	}

	Diagram.prototype.getActor = function(name) {
		var actors = this.actors;
		for (var i in actors) {
			if (actors[i].name == name)
				return actors[i];
		}
		var i = actors.push( new Diagram.Actor(name, actors.length) );
		return actors[ i - 1 ];
	}

	Diagram.prototype.addSignal = function(signal) {
		this.signals.push( signal );
	}

	Diagram.Actor = function(name, index) {
		this.name = name;
		this.index = index;
	}

	Diagram.Signal = function(actorA, signaltype, actorB, message) {
		this.type       = "Signal";
		this.actorA     = actorA;
		this.actorB     = actorB;
		this.linetype   = signaltype;
		this.arrowtype  = signaltype >> 2;
		this.message    = message;
	}

	Diagram.Note = function(actor, placement, message) {
		this.type      = "Note";
		this.actor     = actor;
		this.placement = placement;
		this.message   = message;
	}

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

	/*> grammar.js */

	Diagram.parse = function(input) {	
		//var parser = require("grammar").parser;
		grammar.yy = new Diagram();
		return grammar.parse(input);
	}

	// Expose this class externally
	this.Diagram = Diagram;

}).call(this);