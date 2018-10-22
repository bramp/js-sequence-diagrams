function assertSingleActor(d, alias, name) {

  name = name || alias;

  equal(d.actors.length, 1, 'Correct actors count');

  var a = d.actors[0];
  equal(a.name, name, 'Actors A\'s name');
  equal(a.alias, alias, 'Actors A\'s alias');
  equal(a.index, 0, 'Actors A\'s index');
}

function assertSingleArrow(d, arrowtype, linetype, actorA, actorB, message) {

  actorA = actorA || 'A';
  actorB = actorB || 'B';
  message = message || 'Message';

  equal(d.actors.length, 2, 'Correct actors count');

  var a = d.actors[0];
  var b = d.actors[1];
  equal(a.name, actorA, 'Actors A name');
  equal(b.name, actorB, 'Actors B name');

  equal(d.signals.length, 1, 'Correct signals count');
  equal(d.signals[0].type, 'Signal', 'Correct signal type');
  equal(d.signals[0].actorA, a, 'Actors A');
  equal(d.signals[0].actorB, b, 'Actors B');

  equal(d.signals[0].message, message, 'Signal message');

  equal(d.signals[0].arrowtype, arrowtype, 'Arrowhead type');
  equal(d.signals[0].linetype, linetype, 'Line type');
}

function assertSingleNote(d, placement, actors, message) {

  message = message || 'Message';

  equal(d.signals.length, 1, 'Correct notes count');

  var note = d.signals[0];
  equal(note.type, 'Note', 'Correct signal type');
  equal(note.placement, placement, 'Correct signal placement');
  equal(note.message, message, 'Correct signal message');

  if (_.isArray(actors)) {
    equal(_.isArray(d.actors), true, 'Correct actors array');
    equal(d.actors.length, actors.length, 'Correct actors count');

    equal(note.actor.length, actors.length, 'Correct note actors');
    for (var i = 0; i < actors.length; i++) {
      equal(d.actors[i].name, actors[i], 'Correct actor');
      equal(note.actor[i].name, actors[i], 'Correct note actor');
    }

  } else {
    equal(d.actors.length, 1, 'Correct actors count');
    equal(note.actor.name, actors, 'Correct note actor');
  }
}

function assertEmptyDocument(d) {
  equal(d.title, undefined, 'No title');
  equal(d.actors.length,  0, 'Zero actors');
  equal(d.signals.length, 0, 'Zero signals');
}

var LINETYPE = Diagram.LINETYPE;
var ARROWTYPE = Diagram.ARROWTYPE;
var PLACEMENT = Diagram.PLACEMENT;

/*
function regextest(regex, string) {
	console.log(string, regex.exec(string));
}

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

test('Solid Arrow', function() {
  var d = Diagram.parse('A->B: Message');
  assertSingleArrow(d, ARROWTYPE.FILLED, LINETYPE.SOLID);
});

test('Dashed Arrow', function() {
  var d = Diagram.parse('A-->B: Message');
  assertSingleArrow(d, ARROWTYPE.FILLED, LINETYPE.DOTTED);
});

test('Solid Open Arrow', function() {
  var d = Diagram.parse('A->>B: Message');
  assertSingleArrow(d, ARROWTYPE.OPEN, LINETYPE.SOLID);
});

test('Dashed Open Arrow', function() {
  var d = Diagram.parse('A-->>B: Message');
  assertSingleArrow(d, ARROWTYPE.OPEN, LINETYPE.DOTTED);
});

test('Titles', function() {
  equal(Diagram.parse('Title: title').title, 'title', 'Title');
  equal(Diagram.parse('Title: line1\\nline2').title, 'line1\nline2', 'Multiline Title');
  equal(Diagram.parse('Title title').title, 'title', 'Title without colon');
  equal(Diagram.parse('Title:: title').title, ': title', 'Title with multiple colons');
});

test('Unicode', function() {
  equal(Diagram.parse('Title: 中国').title, '中国', 'Unicode Title');
  assertEmptyDocument(Diagram.parse('# 中国'));
  assertSingleActor(Diagram.parse('Participant 中国'), '中国');
  assertSingleActor(Diagram.parse('Participant 中国 as alias'), 'alias', '中国');
  assertSingleActor(Diagram.parse('中国->中国: Message'), '中国');
});

test('Empty documents', function() {
  assertEmptyDocument(Diagram.parse(''));
  assertEmptyDocument(Diagram.parse(' \t\n'));
  assertEmptyDocument(Diagram.parse('\r\n\r\n'));
});

test('Whitespace', function() {
  assertSingleArrow(Diagram.parse('  A  -  > B  : Message  '), ARROWTYPE.FILLED, LINETYPE.SOLID);
  assertSingleArrow(Diagram.parse('\n\nA->B: Message\n\n'), ARROWTYPE.FILLED, LINETYPE.SOLID);

  assertSingleActor(Diagram.parse('  A  -> A: blah'), 'A');
});

test('Comments', function() {
  // Comments must be on lines on their own
  assertEmptyDocument(Diagram.parse('#'));
  assertEmptyDocument(Diagram.parse('# comment'));
  assertEmptyDocument(Diagram.parse(' # comment'));
  assertEmptyDocument(Diagram.parse('# A->B: Title'));

  // If # is encountered elsewhere, it is part of the names
  assertSingleArrow(Diagram.parse('A#->B: Message'), ARROWTYPE.FILLED, LINETYPE.SOLID, 'A#', 'B');
  assertSingleArrow(Diagram.parse('A->B#: Message'), ARROWTYPE.FILLED, LINETYPE.SOLID, 'A', 'B#');
  assertSingleArrow(Diagram.parse('A->B: Message # not a comment'), ARROWTYPE.FILLED,
      LINETYPE.SOLID, 'A', 'B', 'Message # not a comment');

  equal(Diagram.parse('Title: title # not a comment').title, 'title # not a comment');
  assertSingleNote(Diagram.parse('note left of A: Message # not a comment'), PLACEMENT.LEFTOF, 'A',
      'Message # not a comment');
});

test('Notes', function() {
  assertSingleNote(Diagram.parse('Note left of A: Message'), PLACEMENT.LEFTOF, 'A');
  assertSingleNote(Diagram.parse('Note right of A: Message'), PLACEMENT.RIGHTOF, 'A');
  assertSingleNote(Diagram.parse('Note over A: Message'), PLACEMENT.OVER, 'A');
  assertSingleNote(Diagram.parse('Note over A,B: Message'), PLACEMENT.OVER, ['A', 'B']);

  // We don't allow "as X" when referencing an actor
  assertSingleNote(Diagram.parse('Note over C as A,B: Message'), PLACEMENT.OVER, ['C as A', 'B']);
});

test('Participants', function() {
  assertSingleActor(Diagram.parse('Participant Bob'), 'Bob');
  assertSingleActor(Diagram.parse('Participant Name with spaces'), 'Name with spaces');
  assertSingleActor(Diagram.parse('Participant Name with spaces as alias'),
      'alias', 'Name with spaces');
  assertSingleActor(Diagram.parse('Participant Name with \'as\' in it'), 'Name with \'as\' in it');
  assertSingleActor(Diagram.parse('Participant Double as as alias'), 'alias', 'Double as');
  assertSingleActor(Diagram.parse('Participant Bob \\n with newline'), 'Bob \n with newline');
  assertSingleActor(Diagram.parse('Participant Bob \\n with newline as alias'),
      'alias', 'Bob \n with newline');
  assertSingleActor(Diagram.parse('Participant Object'), 'Object');
});

test('Newlines', function() {
  assertSingleActor(Diagram.parse('Participant A\nNote left of A: Hello'), 'A');
  assertSingleActor(Diagram.parse('Participant A\rNote left of A: Hello'), 'A');
  assertSingleActor(Diagram.parse('Participant A\r\nNote left of A: Hello'), 'A');
});

test('Quoted names', function() {
  assertSingleArrow(Diagram.parse('"->:"->B: M'), ARROWTYPE.FILLED, LINETYPE.SOLID,
      '->:', 'B', 'M');
  assertSingleArrow(Diagram.parse('A->"->:": M'), ARROWTYPE.FILLED, LINETYPE.SOLID,
      'A', '->:', 'M');
  assertSingleActor(Diagram.parse('Participant "->:"'), '->:');
});

test('API', function() {
  // Public API
  ok(typeof Diagram.parse == 'function');

  var d = Diagram.parse('Participant A');
  ok(d instanceof Diagram);
  ok(typeof d.drawSVG == 'function');

  // Private API
  ok(typeof d.getActor == 'function');
  ok(typeof d.getActorWithAlias == 'function');
  ok(typeof d.setTitle == 'function');
  ok(typeof d.addSignal == 'function');
});
