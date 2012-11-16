.PHONY : test clean

all: grammar.js

test: grammar.js
	node grammar.js test

clean:
	rm grammar.js

%.js: %.jison
	jison $<
