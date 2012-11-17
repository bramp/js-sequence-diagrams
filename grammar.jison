
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

%{
	var actors  = [];
	var signals = [];

	var LINETYPE = {
		SOLID  : 0,
		DOTTED : 1
	};

	var ARROWTYPE = {
		FILLED  : 0,
		OPEN    : 1
	};

	var PLACEMENT = {
		LEFTOF  : 0,
		RIGHTOF : 1,
		OVER    : 2
	};

	function getActor(name) {
		for (var i in actors) {
			if (actors[i].name == name)
				return actors[i];
		}
		var i = actors.push( new Actor(name, actors.length) );
		return actors[ i - 1];
	}

	function Actor (name, index) {
		this.name = name;
		this.index = index;
	}

	function Signal (actorA, signaltype, actorB, message) {
		this.type       = "Signal";
		this.actorA     = actorA;
		this.actorB     = actorB;
		this.signaltype = signaltype;
		this.message    = message;
	}

	function Note (actor, placement, message) {
		this.type      = "Note";
		this.actor     = actor;
		this.placement = placement;
		this.message   = message;
	}
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

%start document

%% /* language grammar */

document: /* empty */
	| document line   { }
	;

line
	: statement 'NL'  { }
	| statement 'EOF' { }
	| 'EOF'
	;

statement
	: 'participant' actor  { /* do nothing */  }
	| signal               { signals.push($1); }
	| note_statement       { signals.push($1); }
	;

note_statement
	: 'note' placement actor message   { $$ = new Note($3, $2, $4); }
	;

placement
	: 'left_of'   { $$ = PLACEMENT.LEFTOF; }
	| 'right_of'  { $$ = PLACEMENT.RIGHTOF; }
	| 'over'      { $$ = PLACEMENT.OVER; }
	;

signal
	: actor signaltype actor message
	{ $$ = new Signal($1, $2, $3, $4); }
	;

actor
	: ACTOR { $$ = getActor($1); }
	;

signaltype
	: linetype arrowtype  { $$ = $1 | ($2 << 2); }
	| linetype            { $$ = $1; }
	;

linetype
	: LINE      { $$ = LINETYPE.SOLID; }
	| DOTLINE   { $$ = LINETYPE.DOTTED; }
	;

arrowtype
	: ARROW     { $$ = ARROWTYPE.FILLED; }
	| OPENARROW { $$ = ARROWTYPE.OPEN; }
	;

message
	: MESSAGE { $$ = $1.substring(1); }
	;