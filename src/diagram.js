/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2013 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
	/*global grammar _ */

	function Diagram() {
		this.title   = undefined;
		this.actors  = [];
		this.signals = [];
	}

	/*
	 * Return an existing actor with this alias, or creates a new one with alias and name.
	 */
	Diagram.prototype.getActor = function(alias, name) {
		alias = alias.trim();

		var i, actors = this.actors;
		for (i in actors) {
			if (actors[i].alias == alias)
				return actors[i];
		}
		i = actors.push( new Diagram.Actor(alias, (name || alias), actors.length) );
		return actors[ i - 1 ];
	};

	/*
	 * Parses the input as either a alias, or a "name as alias", and returns the corresponding actor.
	 */
	Diagram.prototype.getActorWithAlias = function(input) {
		input = input.trim();

		// We are lazy and do some of the parsing in javascript :(. TODO move into the .jison file.
		var s = /([\s\S]+) as (\S+)$/im.exec(input);
		var alias, name;
		if (s) {
			name  = s[1].trim();
			alias = s[2].trim();
		} else {
			name = alias = input;
		}

		return this.getActor(alias, name);
	};

	Diagram.prototype.setTitle = function(title) {
		this.title = title;
	};

	Diagram.prototype.addSignal = function(signal) {
		this.signals.push( signal );
	};

	Diagram.Actor = function(alias, name, index) {
		this.alias = alias;
		this.name  = name;
		this.index = index;
	};

	Diagram.Signal = function(actorA, signaltype, actorB, message) {
		this.type       = "Signal";
		this.actorA     = actorA;
		this.actorB     = actorB;
		this.linetype   = signaltype & 3;
		this.arrowtype  = (signaltype >> 2) & 3;
		this.message    = message;
	};

	Diagram.Signal.prototype.isSelf = function() {
		return this.actorA.index == this.actorB.index;
	};

	Diagram.Note = function(actor, placement, message) {
		this.type      = "Note";
		this.actor     = actor;
		this.placement = placement;
		this.message   = message;

		if (this.hasManyActors() && actor[0] == actor[1]) {
			throw new Error("Note should be over two different actors");
		}
	};

	Diagram.Note.prototype.hasManyActors = function() {
		return _.isArray(this.actor);
	};

	Diagram.unescape = function(s) {
		// Turn "\\n" into "\n"
		return s.trim().replace(/\\n/gm, "\n");
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

	/** The following is included by jspp */
	/*> ../build/grammar.js */

	/**
	 * jison doesn't have a good exception, so we make one.
	 * This is brittle as it depends on jison internals
	 */
	function ParseError(message, hash) {
		_.extend(this, hash);

		this.name = "ParseError";
		this.message = (message || "");
	}
	ParseError.prototype = new Error();
	Diagram.ParseError = ParseError;

	Diagram.parse = function(input) {
		// Create the object to track state and deal with errors
		parser.yy = new Diagram();
		parser.yy.parseError = function(message, hash) {
			throw new ParseError(message, hash);
		};

		// Parse
		var diagram = parser.parse(input);

		// Then clean up the parseError key that a user won't care about
		delete diagram.parseError;
		return diagram;
	};



