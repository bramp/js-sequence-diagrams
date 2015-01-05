.PHONY : all test clean lint

NODE_MODULES := node_modules/.bin

all: node_modules lint build/sequence-diagram-min.js

node_modules: package.json
	#
	# NPM Update needed.
	#
	npm update

clean:
	rm build/*

lint:
	$(NODE_MODULES)/jshint src/*.js
	$(NODE_MODULES)/jshint test/grammar-tests.js

build/grammar.js: src/grammar.jison
	$(NODE_MODULES)/jison $< -o $@

build/diagram-grammar.js: src/diagram.js build/grammar.js
	#
	# Compiling grammar
	#
	jspp $< > $@ || (rm $@ && exit 127)

build/sequence-diagram-min.js build/sequence-diagram-min.js.map: src/copyright.js build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js src/sequence-diagram.js
	#
	# Please ignore the warnings below (these are in combined js code)
	#
	$(NODE_MODULES)/uglifyjs \
		src/copyright.js \
		build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js \
		src/sequence-diagram.js \
		-o build/sequence-diagram-min.js \
		-c --comments \
		--source-map build/sequence-diagram-min.js.map

	#
	# Copy minified file to site
	#
	cp build/sequence-diagram-min.js* _site/
