/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2013 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
(function () {
	"use strict";
	/*global grammar _ */

	function Diagram() {
		this.title   = undefined;
		this.actors  = [];
		this.signals = [];
	}

	Diagram.prototype.getActor = function(alias) {
		alias = alias.trim();
		var s = /^(.+) as (\S+)$/i.exec(alias);
		var name;
		if (s) {
			name  = s[1].trim();
			alias = s[2].trim();
		} else {
			name = alias.trim();
		}

		name = name.replace(/\\n/gm, "\n");
		var i, actors = this.actors;
		for (i in actors) {
			if (actors[i].alias == alias)
				return actors[i];
		}
		var message = new Diagram.Message(name);
		i = actors.push( new Diagram.Actor(alias, message, actors.length) );
		return actors[ i - 1 ];
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
	
	Diagram.Message = function(message) {
		this.type = "Message";
		this.text = message;
	};
	
	Diagram.Message.prototype.setAttr = function(attr_obj) {
		this.attr = attr_obj;
	};
	
	Diagram.Attributes = function(attr_str) {
		this.type = "Attributes";
		var text = Object.create({}, { 
			fill: {
				value: "black",
				writable: true,
				enumerable: true,
				configrable: true
			},
			url: {
				writable: true,
				enumerable: true,
				configrable: true
			}
		});
		
		var box = Object.create({}, {
			url: {
				writable: true,
				enumerable: true,
				configrable: true
			},
			fill: {
				value: "white",
				writable: true,
				enumerable: true,
				configrable: true
			}
		});
		
		var line = Object.create({}, {
			url: {
				writable: true,
				enumerable: true,
				configrable: true
			}
		});
		
		var paper = Object.create({}, {
			fill: {
				writable: true,
				enumerable: true,
				configrable: true
			}
		});
		
		var attribs = attr_str.split(",");
		
		attribs.map(function(attr) {
			/* split key value pairs foo="bar" accounting for different
			 * quotes and spaces
			 */
		    /^\s*(?:'|")?(.*?)(?:'|")?\s*=\s*(?:'|")(.*?)(?:'|")?\s*$/.exec(attr);
		    /* raphael implements attributes based on 
		     * types of objects, however attributes that
		     * DOT provides are flat, so we will attempt to
		     * translate DOT attributes to raphael
		     */	
		    var key = RegExp.$1.toLowerCase();
		    var value = RegExp.$2;
		    
		    switch(key) {
		    case "color":
		    	line.stroke = value;
		    	break;
		    case "bgcolor":
		    	paper.fill = value;
		    	break;
		    case "fillcolor":
		    	box.fill = value;
		    	break;
		    case "fontcolor":
		    	text.fill = value;
		    	break;
		    case "url":
		    case "href":
		    	text.href = value;
		    	box.href = value;
		    	line.href = value;
		    	break;
		    default:
		    	break;
		    }
		});	
		    
		this.text = text;
		this.box = box;
		this.line = line;
	};

	Diagram.Note.prototype.hasManyActors = function() {
		return _.isArray(this.actor);
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
	 * jison doesn't have a good exception, so we make one
	 */
	function ParseError(message, hash) {
		_.extend(this, hash);

		this.name = "ParseError";
		this.message = (message || "");
	}
	ParseError.prototype = new Error();
	Diagram.ParseError = ParseError;

	grammar.parseError = function(message, hash) {
		throw new ParseError(message, hash);
	};

	Diagram.parse = function(input) {
		grammar.yy = new Diagram();
		
		return grammar.parse(input);
	};

	// Expose this class externally
	this.Diagram = Diagram;
	

}).call(this);
