function assertSingleArrow(d) {

	equal(d.actors.length, 2, "Correct actors count");

	var a = d.actors[0];
	var b = d.actors[1]
	equal(a.name, "A", "Actors A");
	equal(b.name, "B", "Actors B");

	equal(d.signals[0].message, "Title", "Signal message");

	equal(d.signals.length, 1, "Correct signals count");
	equal(d.signals[0].actorA, a, "Actors A");
	equal(d.signals[0].actorB, b, "Actors B");
}

test( "Solid Arrow", function() {
	var d = Diagram.parse("A->B: Title");
	assertSingleArrow(d);
	equal(d.signals[0].arrowtype, 0, "Arrowhead type");
	equal(d.signals[0].linetype, 0, "Line type");
});

test( "Dashed Arrow", function() {
	var d = Diagram.parse("A-->B: Title");
	assertSingleArrow(d);
	equal(d.signals[0].arrowtype, 0, "Arrowhead type");
	equal(d.signals[0].linetype, 1, "Line type");
});

test( "Solid Open Arrow", function() {
	var d = Diagram.parse("A->>B: Title");
	assertSingleArrow(d);
	equal(d.signals[0].arrowtype, 1, "Arrowhead type");
	equal(d.signals[0].linetype, 0, "Line type");
});

test( "Dashed Open Arrow", function() {
	var d = Diagram.parse("A-->>B: Title");
	assertSingleArrow(d);
	equal(d.signals[0].arrowtype, 1, "Arrowhead type");
	equal(d.signals[0].linetype, 1, "Line type");
});

test( "Titles", function() {
	equal(Diagram.parse("Title: title").title, "title", "Title");
	equal(Diagram.parse("Title: line1\\nline2").title, "line1\nline2", "Multiline Title");

	equal(Diagram.parse("Title: 中国").title, "中国", "Unicode Title");
});

function assertEmptyDocument(d) {
	equal(d.title, undefined, "No title");
	equal(d.actors.length,  0, "Zero actors");
	equal(d.signals.length, 0, "Zero signals");
}

test( "Empty documents", function() {
	assertEmptyDocument(Diagram.parse(""));
	assertEmptyDocument(Diagram.parse(" \t\n"));
});

test( "Comments", function() {
	assertEmptyDocument(Diagram.parse("#"));
	assertEmptyDocument(Diagram.parse("# comment"));
	assertEmptyDocument(Diagram.parse(" # comment"));
	assertEmptyDocument(Diagram.parse("# A->B: Title"));
	assertSingleArrow(Diagram.parse("A->B: Title # comment"));
	//"title Title # comment"
	//"participant A # comment"
	//"note left of A: blah # comment"
});