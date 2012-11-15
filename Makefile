.PHONY : test clean

test: grammar.js
	node grammar.js test

clean:
	rm grammar.js

%.js: %.jison
	jison -d $<
