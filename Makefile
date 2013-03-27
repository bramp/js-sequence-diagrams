.PHONY : all test clean lint

all: sequence-diagram-min.js

clean:
	rm sequence-diagram-min.js* grammar.js diagram-grammar.js

lint:
	jshint src/*.js

diagram-grammar.js: src/diagram.js grammar.js
	#
	# Compiling grammar
	#
	jspp src/diagram.js > diagram-grammar.js

sequence-diagram-min.js: diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js src/sequence-diagram.js
	#
	# Ignore warnings from diagram-grammar.js
	#
	uglifyjs \
		diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js \
		src/sequence-diagram.js \
		-o sequence-diagram-min.js \
		-c --comments \
		--source-map sequence-diagram-min.js.map

	#
	# Copy minified file to site
	#
	cp sequence-diagram-min.js _site/

grammar.js: src/grammar.jison
	jison $<
