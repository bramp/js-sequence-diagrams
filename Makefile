.PHONY : all test dependencies clean veryclean lint js css font

NODE_MODULES := node_modules/.bin
BOWER_COMPONENTS := bower_components

all: lint js css test
	#
	# Copy minified file to site
	#
	cp build/sequence-diagram*-min.js* _site/

js: build/sequence-diagram-min.js build/sequence-diagram-raphael-min.js build/sequence-diagram-snap-min.js
css: build/sequence-diagram-min.css font
font: build/danielbd.woff2 build/danielbd.woff


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

	$(NODE_MODULES)/jsonlint .jscsrc -q
	$(NODE_MODULES)/jscs --fix src/*.js
	$(NODE_MODULES)/jscs --fix test/*.js

test: dependencies build/sequence-diagram-min.js

	# Test the un-minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the un-minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

	# Test the minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c build/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

build/grammar.js: src/grammar.jison
	$(NODE_MODULES)/jison $< -o $@.tmp

	# After building the grammar, run it through the uglifyjs to fix some non-strict issues.
	# Until https://github.com/zaach/jison/issues/285 is fixed, we must do this to create valid non-minified code.
	$(NODE_MODULES)/uglifyjs \
		$@.tmp -o $@ \
		--comments all --compress --beautify

	rm $@.tmp

# Compile the grammar
build/diagram-grammar.js: src/diagram.js build/grammar.js
	$(NODE_MODULES)/preprocess $< . > $@

# Combine all javascript files together (Raphael and Snap.svg)
build/sequence-diagram.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-snap.js src/theme-raphael.js fonts/daniel/daniel_700.font.js
	$(NODE_MODULES)/preprocess $< . -SNAP=true -RAPHAEL=true  > $@

# Combine just Raphael theme
build/sequence-diagram-raphael.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-raphael.js fonts/daniel/daniel_700.font.js
	$(NODE_MODULES)/preprocess $< . -RAPHAEL=true > $@

# Combine just Snap.svg theme
build/sequence-diagram-snap.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-snap.js
	$(NODE_MODULES)/preprocess $< . -SNAP=true > $@

# Minify the final combined javascript (both Raphael and Snap.svg)
#build/sequence-diagram-raphael-min.js build/sequence-diagram-raphael-min.js.map: build/sequence-diagram-raphael.js
#build/sequence-diagram-snap-min.js build/sequence-diagram-snap-min.js.map: build/sequence-diagram-snap.js

build/sequence-diagram.css: src/sequence-diagram.css
	cp $< $@

# Minify the CSS
build/sequence-diagram-min.css: build/sequence-diagram.css
	$(NODE_MODULES)/minify --output $@ $<

# Move some fonts TODO optomise the fonts
build/%.woff: fonts/daniel/%.woff
	cp $< $@

build/%.woff2: fonts/daniel/%.woff2
	cp $< $@

#build/sequence-diagram-min.js build/sequence-diagram-min.js.map: build/sequence-diagram.js
build/%-min.js build/%-min.js.map: build/%.js

	#
	# Please ignore the warnings below (these are in combined js code)
	#
	$(NODE_MODULES)/uglifyjs \
		$< -o $@ \
		--compress --comments --lint \
		--source-map $<.map \
		--source-map-url `basename $<`
