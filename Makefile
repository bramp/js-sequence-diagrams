.PHONY : all test dependencies clean veryclean lint

NODE_MODULES := node_modules/.bin
BOWER_COMPONENTS := bower_components

all: node_modules lint build test

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
	$(NODE_MODULES)/bower update -q
	touch $@

dependencies: node_modules bower_components

clean:
	-rm build/*

veryclean: clean
	-rm -rf node_modules
	-rm -rf bower_components

lint:
	npm run lint

test: dependencies build

	# Test the un-minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the un-minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/lodash/lodash.min.js

	# Test the minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/raphael-mock.js $(BOWER_COMPONENTS)/lodash/lodash.min.js

build:
	npm run build
	#
	# Copy minified file to site
	#
	cp build/sequence-diagram-min.js* _site/
