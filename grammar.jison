/* lexical grammar */
%lex

%{
	// Pre-lexer code can go here
%}

%%

[\n]+             return 'NL';
[ \t]+             /* skip whitespace */
"participant"     return 'participant'
"left of"         return 'left_of'
"right of"        return 'right_of'
"over"            return 'over'
"note"            return 'note'
[^->:\n]+\b       return 'ACTOR'
"--"              return 'DOTLINE'
"-"               return 'LINE'
">>"              return 'OPENARROW'
">"               return 'ARROW'
:[^\n]+           return 'MESSAGE'
<<EOF>>           return 'EOF'
.                 return 'INVALID'

/lex

%start start

%% /* language grammar */

start
	: document {
		console.log(this.yy);
		this.yy = 1;
		var olddoc = doc;
		doc = new Diagram(); // Reset
		return olddoc;
	  }
	;

document: /* empty */
	| document line   { }
	;

line
	: statement 'NL'  { }
	| statement 'EOF' { }
	| 'NL' | 'EOF'
	;

statement
	: 'participant' actor  { /* do nothing */  }
	| signal               { doc.addSignal($1); }
	| note_statement       { doc.addSignal($1); }
	;

note_statement
	: 'note' placement actor message   { $$ = new Diagram.Note($3, $2, $4); }
	;

placement
	: 'left_of'   { $$ = Diagram.PLACEMENT.LEFTOF; }
	| 'right_of'  { $$ = Diagram.PLACEMENT.RIGHTOF; }
	| 'over'      { $$ = Diagram.PLACEMENT.OVER; }
	;

signal
	: actor signaltype actor message
	{ $$ = new Diagram.Signal($1, $2, $3, $4); }
	;

actor
	: ACTOR { $$ = doc.getActor($1); }
	;

signaltype
	: linetype arrowtype  { $$ = $1 | ($2 << 2); }
	| linetype            { $$ = $1; }
	;

linetype
	: LINE      { $$ = Diagram.LINETYPE.SOLID; }
	| DOTLINE   { $$ = Diagram.LINETYPE.DOTTED; }
	;

arrowtype
	: ARROW     { $$ = Diagram.ARROWTYPE.FILLED; }
	| OPENARROW { $$ = Diagram.ARROWTYPE.OPEN; }
	;

message
	: MESSAGE { $$ = $1.substring(1); }
	;


%%

// This is the Window this

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
	this.signaltype = signaltype;
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

var doc = new Diagram();

