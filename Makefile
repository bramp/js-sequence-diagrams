.PHONY : all test clean lint

all: sequence-diagram-min.js

test: grammar.js
	node grammar.js test

clean:
	rm sequence-diagram-min.js grammar.js 

lint:
	jshint src/*.js

sequence-diagram-min.js: grammar.js src/diagram.js src/jquery-plugin.js src/sequence-diagram.js
	jspp src/sequence-diagram.js | \
		uglifyjs -o sequence-diagram-min.js -c --comments
	cp sequence-diagram-min.js _site/

%.js: src/%.jison
	jison $<
