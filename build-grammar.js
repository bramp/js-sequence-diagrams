// temporary solution of https://github.com/zaach/jison/issues/300
var Parser = require('jison').Parser;
var fs = require('fs');
var path = require('path');

var options = {
  moduleMain: function() {}
};

var grammar = fs.readFileSync(path.join(__dirname, 'src/grammar.jison'), 'utf8');
var parser = new Parser(grammar);
var parserSource = parser.generate(options);
fs.writeFileSync(path.join(__dirname, 'src/grammar.js'), parserSource, 'utf8');
