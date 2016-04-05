.PHONY : all test dependencies clean veryclean lint

NODE_MODULES := node_modules/.bin
BOWER_COMPONENTS := bower_components

all: node_modules lint build/sequence-diagram-min.js test

node_modules: package.json
	#
	# NPM update needed.
	#
	npm update
	touch $@

bower_components: bower.json
	#
	# Bower update needed.
	#
	$(NODE_MODULES)/bower update
	touch $@

dependencies: node_modules bower_components

clean:
	-rm build/*

veryclean: clean
	-rm -rf node_modules
	-rm -rf bower_components

lint: dependencies package.json bower.json
	$(NODE_MODULES)/jshint --verbose src/*.js
	$(NODE_MODULES)/jshint --verbose test/*.js
	$(NODE_MODULES)/jsonlint package.json -q
	$(NODE_MODULES)/jsonlint bower.json -q

test: dependencies build/sequence-diagram-min.js

	# Test the un-minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the un-minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

	# Test the minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

build/grammar.js: src/grammar.jison
	$(NODE_MODULES)/jison $< -o $@.tmp

	# After building the grammar, run it through the uglifyjs to fix some non-strict issues.
	# Until https://github.com/zaach/jison/issues/285 is fixed, we must do this to create valid non-minified code.
	$(NODE_MODULES)/uglifyjs \
		$@.tmp -o $@ \
		--comments all --compress --beautify

build/diagram-grammar.js: src/diagram.js build/grammar.js
	#
	# Compiling grammar
	#
	$(NODE_MODULES)/preprocess $< . > $@

build/sequence-diagram.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js fonts/daniel/daniel_700.font.js src/sequence-diagram.js
	#
	# Finally combine all javascript files together
	#
	$(NODE_MODULES)/preprocess $< . > $@

build/sequence-diagram-min.js build/sequence-diagram-min.js.map: build/sequence-diagram.js
	#
	# Please ignore the warnings below (these are in combined js code)
	#
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
