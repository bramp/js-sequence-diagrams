
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

"\n"              return '\n'
[\s]+             /* skip whitespace */
"participant"     return 'participant'
[^->:\n]+         return 'ACTOR'
"--"              return 'DOTLINE'
"-"               return 'LINE'
">>"              return 'OPENARROW'
">"               return 'ARROW'
(:)[^\n]+         return 'MESSAGE'
<<EOF>>           return 'EOF'
.                 return 'INVALID'

/lex

%start document

%% /* language grammar */

document: /* empty */
	| document line   { console.log('document'); }
	;

line
	: '\n'
	| statement '\n'  { console.log('line'); }
	;

statement
	: signal          { console.log('s'); }
	| p               { console.log('p'); }
	;

p
	: 'participant' ACTOR { return $2 }
	;

signal
	: ACTOR signaltype ACTOR MESSAGE
	{ console.log($1 + ' ' + $2 + ' ' + $3 + ' ' + $4); }

	;

signaltype
	: linetype arrowtype  { return $1 + ' ' + $2 }
	| linetype            { return $1 }
	;

linetype
	: LINE      { return "a" }
	| DOTLINE   { return "b" }
	;

arrowtype
	: ARROW     { return "a" }
	| OPENARROW { return "b" }
	;

message
	: ":" 
	;

