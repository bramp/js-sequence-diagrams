.PHONY : all test clean

all: sequence-diagram-min.js

test: grammar.js
	node grammar.js test

clean:
	rm sequence-diagram-min.js grammar.js

sequence-diagram-min.js: grammar.js src/diagram.js src/jquery-plugin.js src/sequence-diagram.js
	jspp src/sequence-diagram.js > jspp-output.js
	uglifyjs jspp-output.js -o sequence-diagram-min.js -c --comments
	mv jspp-output.js _site/sequence-diagram.js
	cp sequence-diagram-min.js _site/

%.js: src/%.jison
	jison $<
