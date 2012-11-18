.PHONY : test clean

all: bundle.js

test: grammar.js
	node grammar.js test

clean:
	rm grammar.js

bundle.js: grammar.js svg-sequence-diagrams.js
	jspp svg-sequence-diagrams.js > bundle.js

%.js: %.jison
	jison $<
