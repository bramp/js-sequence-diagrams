.PHONY : all test dependencies clean veryclean lint

NODE_MODULES := node_modules/.bin
BOWER_COMPONENTS := bower_components

all: node_modules lint build/sequence-diagram-min.js test

node_modules: package.json
	#
	# NPM update needed.
	#
	npm update

bower_components: bower.json
	#
	# Bower update needed.
	#
	bower update

dependencies: node_modules bower_components

clean:
	rm build/*

veryclean: clean
	rm -rf node_modules
	rm -rf bower_components

lint: dependencies
	$(NODE_MODULES)/jshint src/*.js
	$(NODE_MODULES)/jshint test/*.js

test: dependencies build/sequence-diagram-min.js

	# Test the un-minifed file
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

build/grammar.js: src/grammar.jison
	$(NODE_MODULES)/jison $< -o $@

build/diagram-grammar.js: src/diagram.js build/grammar.js
	#
	# Compiling grammar
	#
	jspp $< > $@ || (rm $@ && exit 127)

build/sequence-diagram.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js src/sequence-diagram.js
	#
	# Compiling grammar
	#
	jspp $< > $@ || (rm $@ && exit 127)

build/sequence-diagram-min.js build/sequence-diagram-min.js.map: build/sequence-diagram.js
	#
	# Please ignore the warnings below (these are in combined js code)
	# --beautify --compress --mangle
	$(NODE_MODULES)/uglifyjs \
		build/sequence-diagram.js \
		-o build/sequence-diagram-min.js \
		--compress --comments --lint \
		--source-map build/sequence-diagram-min.js.map \
		--source-map-url sequence-diagram-min.js.map

	#
	# Copy minified file to site
	#
	cp build/sequence-diagram-min.js* _site/
