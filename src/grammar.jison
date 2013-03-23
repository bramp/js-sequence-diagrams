/* lexical grammar */
%lex

%options case-insensitive

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
"title"           return 'title'
[^\->:\n,]+\b     return 'ACTOR'
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
	: document { return yy; }
	;

document
	: /* empty */
	| document line
	;

line
	: statement 'NL'  { }
	| statement 'EOF' { }
	| 'NL' | 'EOF'
	;

statement
	: 'participant' actor  { /* do nothing */  }
	| signal               { yy.addSignal($1); }
	| note_statement       { yy.addSignal($1); }
	| 'title' message      { yy.setTitle($2);  }
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
	: ACTOR { $$ = yy.getActor($1.replace(/\\n/gm, "\n")); }
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
	: MESSAGE { $$ = $1.substring(1).trim().replace(/\\n/gm, "\n"); }
	;


%%
