function assertSingleActor(d, actor) {

	equal(d.actors.length, 1, "Correct actors count");

	var a = d.actors[0];
	equal(a.name, actor, "Actors A's name");
}

function assertSingleArrow(d, arrowtype, linetype) {

	equal(d.actors.length, 2, "Correct actors count");

	var a = d.actors[0];
	var b = d.actors[1];
	equal(a.name, "A", "Actors A");
	equal(b.name, "B", "Actors B");

	equal(d.signals.length, 1, "Correct signals count");
	equal(d.signals[0].type, "Signal", "Correct signal type");
	equal(d.signals[0].actorA, a, "Actors A");
	equal(d.signals[0].actorB, b, "Actors B");

	equal(d.signals[0].message, "Title", "Signal message");

	equal(d.signals[0].arrowtype, arrowtype, "Arrowhead type");
	equal(d.signals[0].linetype, linetype, "Line type");
}

function assertSingleNote(d, placement, actors) {

	equal(d.signals.length, 1, "Correct notes count");
	
	var note = d.signals[0];
	equal(note.type, "Note", "Correct signal type");
	equal(note.placement, placement, "Correct signal placement");
	equal(note.message, "Title", "Correct signal message");

	if (_.isArray(actors)) {
		equal(_.isArray(d.actors), true, "Correct actors array");
		equal(d.actors.length, actors.length, "Correct actors count");

		equal(note.actor.length, actors.length, "Correct note actors");
		for (var i = 0; i < actors.length; i++) {
			equal(d.actors[i].name, actors[i], "Correct actor");
			equal(note.actor[i].name, actors[i], "Correct note actor");
		}
		
	} else {
		equal(d.actors.length, 1, "Correct actors count");
		equal(note.actor.name, actors, "Correct note actor");
	}
}

function assertEmptyDocument(d) {
	equal(d.title, undefined, "No title");
	equal(d.actors.length,  0, "Zero actors");
	equal(d.signals.length, 0, "Zero signals");
}


var LINETYPE = Diagram.LINETYPE;
var ARROWTYPE = Diagram.ARROWTYPE;
var PLACEMENT = Diagram.PLACEMENT;

function regextest(regex, string) {
	console.log(string, regex.exec(string));
}

/*
test("Regex Tests", function() {
	// These are here to debug regex problems with unicode
	//var r = /[^\->:\n,]+\b/;
	var r = /[^\->:\n,]+/;
	regextest(r, "blah");
	regextest(r, "bl:ah");
	regextest(r, "中国");
	regextest(r, " 中国 ");

	regextest(/^(.+) as (\S+)\s*$/i, "blah");
	regextest(/^(.+) as (\S+)\s*$/i, " as as as b");
});
*/

test( "Solid Arrow", function() {
	var d = Diagram.parse("A->B: Title");
	assertSingleArrow(d, ARROWTYPE.FILLED, LINETYPE.SOLID);
});

test( "Dashed Arrow", function() {
	var d = Diagram.parse("A-->B: Title");
	assertSingleArrow(d, ARROWTYPE.FILLED, LINETYPE.DOTTED);
});

test( "Solid Open Arrow", function() {
	var d = Diagram.parse("A->>B: Title");
	assertSingleArrow(d, ARROWTYPE.OPEN, LINETYPE.SOLID);
});

test( "Dashed Open Arrow", function() {
	var d = Diagram.parse("A-->>B: Title");
	assertSingleArrow(d, ARROWTYPE.OPEN, LINETYPE.DOTTED);
});

test( "Titles", function() {
	equal(Diagram.parse("Title: title").title, "title", "Title");
	equal(Diagram.parse("Title: line1\\nline2").title, "line1\nline2", "Multiline Title");
});

test( "Unicode", function() {
	equal(Diagram.parse("Title: 中国").title, "中国", "Unicode Title");
	assertEmptyDocument(Diagram.parse("# 中国"));
	assertSingleActor(Diagram.parse("Participant 中国"), "中国");
	assertSingleActor(Diagram.parse("Participant 中国 as alias"), "中国");
	assertSingleActor(Diagram.parse("中国->中国: Title"), "中国");
});

test( "Empty documents", function() {
	assertEmptyDocument(Diagram.parse(""));
	assertEmptyDocument(Diagram.parse(" \t\n"));
});

test( "Whitespace", function() {
	assertSingleArrow(Diagram.parse("  A  -  > B  : Title  "), ARROWTYPE.FILLED, LINETYPE.SOLID);
	assertSingleArrow(Diagram.parse("\n\nA->B: Title\n\n"), ARROWTYPE.FILLED, LINETYPE.SOLID);
});

test( "Comments", function() {
	assertEmptyDocument(Diagram.parse("#"));
	assertEmptyDocument(Diagram.parse("# comment"));
	assertEmptyDocument(Diagram.parse(" # comment"));
	assertEmptyDocument(Diagram.parse("# A->B: Title"));
	assertSingleArrow(Diagram.parse("A->B: Title # comment"), 0, 0);

	equal(Diagram.parse("Title: title # comment").title, "title");
	//assertEmptyDocument(Diagram.parse("participant A # comment"));
	assertSingleNote(Diagram.parse("note left of A: Title # comment"), PLACEMENT.LEFTOF, 'A');
});

test( "Notes", function() {
	assertSingleNote(Diagram.parse("Note left of A: Title"), PLACEMENT.LEFTOF, 'A');
	assertSingleNote(Diagram.parse("Note right of A: Title"), PLACEMENT.RIGHTOF, 'A');
	assertSingleNote(Diagram.parse("Note over A: Title"), PLACEMENT.OVER, 'A');
	assertSingleNote(Diagram.parse("Note over A,B: Title"), PLACEMENT.OVER, ['A', 'B']);
});


test( "Participants", function() {
	assertSingleActor(Diagram.parse("Participant Bob"), "Bob");
	assertSingleActor(Diagram.parse("Participant Name with spaces"), "Name with spaces");
	assertSingleActor(Diagram.parse("Participant Name with spaces as alias"), "Name with spaces");
	assertSingleActor(Diagram.parse("Participant Name with 'as' in it"), "Name with 'as' in it");
	assertSingleActor(Diagram.parse("Participant Bob \\n with newline"), "Bob \n with newline");
	assertSingleActor(Diagram.parse("Participant Bob \\n with newline as alias"), "Bob \n with newline");
	assertSingleActor(Diagram.parse("Participant Object"), "Object");
});

