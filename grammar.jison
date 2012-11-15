
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

[\n]+             return 'NL';
[ \t]+             /* skip whitespace */
"participant"     return 'participant'
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
	| document line   { console.log('document'); }
	;

line
	: statement 'NL'  { console.log('line ' + $1); }
	| 'EOF'
	;

statement
	: signal               { $$ = 'signal ' + $1; console.log($$) }
	| 'participant' ACTOR  { $$ = 'participant ' + $2; console.log($$) }
	;

signal
	: ACTOR signaltype ACTOR message
	{ $$ = $1 + ' ' + $2 + ' ' + $3 + ' ' + $4; }

	;

signaltype
	: linetype arrowtype  { $$ = $1 + $2; }
	| linetype            { $$ = $1; }
	;

linetype
	: LINE      { $$ = '-'; }
	| DOTLINE   { $$ = '--'; }
	;

arrowtype
	: ARROW     { $$ = '>'; }
	| OPENARROW { $$ = '>>'; }
	;

message
	: MESSAGE { $$ = $1; }
	;