.PHONY : all test clean

all: sequence-diagram-min.js

test: grammar.js
	node grammar.js test

clean:
	rm sequence-diagram-min.js grammar.js 

sequence-diagram-min.js: grammar.js src/diagram.js src/jquery-plugin.js src/sequence-diagram.js
	jspp src/sequence-diagram.js | \
		uglifyjs -o sequence-diagram-min.js -c --comments

%.js: src/%.jison
	jison $<
