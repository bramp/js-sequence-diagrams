.PHONY : test clean

all: sequence-diagram-min.js

test: grammar.js
	node grammar.js test

clean:
	rm grammar.js

sequence-diagram-min.js: grammar.js sequence-diagram.js
	jspp sequence-diagram.js | \
		uglifyjs -o sequence-diagram-min.js -c --comments

%.js: %.jison
	jison $<
