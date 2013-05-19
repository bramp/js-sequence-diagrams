.PHONY : all test clean lint

all: lint build/sequence-diagram-min.js

clean:
	rm build/*

lint:
	jshint src/*.js

build/grammar.js: src/grammar.jison
	~/vendor/jison/jison/node_modules/.bin/jison $< -o $@

build/diagram-grammar.js: src/diagram.js build/grammar.js
	#
	# Compiling grammar
	#
	jspp $< > $@

build/sequence-diagram-min.js build/sequence-diagram-min.js.map: src/copyright.js build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js src/sequence-diagram.js
	#
	# Please ignore the warnings below (these are in combined js code)
	#
	uglifyjs \
		src/copyright.js \
		build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js \
		src/sequence-diagram.js \
		-o build/sequence-diagram-min.js \
		-c --comments \
		-b \
		--source-map build/sequence-diagram-min.js.map

	#
	# Copy minified file to site
	#
	cp build/sequence-diagram-min.js _site/
