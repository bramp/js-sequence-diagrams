.PHONY : all test dependencies clean veryclean lint js css font

NODE_MODULES := node_modules/.bin
BOWER_COMPONENTS := bower_components

all: lint js css test
js: dist/sequence-diagram-min.js dist/sequence-diagram-raphael-min.js dist/sequence-diagram-snap-min.js
css: dist/sequence-diagram-min.css font
font: dist/danielbd.woff2 dist/danielbd.woff

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
	-git checkout -- dist

veryclean: clean
	-rm -rf node_modules
	-rm -rf bower_components

lint: dependencies package.json bower.json
	$(NODE_MODULES)/jsonlint package.json -q
	$(NODE_MODULES)/jsonlint bower.json -q

	$(NODE_MODULES)/eslint src/*.js
	$(NODE_MODULES)/eslint test/*.js

test: dependencies dist/sequence-diagram-min.js

	# Test the un-minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c dist/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the un-minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c dist/sequence-diagram.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

	# Test the minifed file (with underscore)
	$(NODE_MODULES)/qunit \
		-c dist/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/underscore/underscore-min.js

	# Test the minifed file (with lodash)
	$(NODE_MODULES)/qunit \
		-c dist/sequence-diagram-min.js \
		-t test/*-tests.js \
		-d test/*-mock.js $(BOWER_COMPONENTS)/lodash/dist/lodash.min.js

build/grammar.js: src/grammar.jison
	mkdir -p build
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
dist/sequence-diagram.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-snap.js src/theme-raphael.js fonts/daniel/daniel_700.font.js
	mkdir -p dist
	$(NODE_MODULES)/preprocess $< . -SNAP=true -RAPHAEL=true  > $@

# Combine just Raphael theme
dist/sequence-diagram-raphael.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-raphael.js fonts/daniel/daniel_700.font.js
	$(NODE_MODULES)/preprocess $< . -RAPHAEL=true > $@

# Combine just Snap.svg theme
dist/sequence-diagram-snap.js: src/main.js build/diagram-grammar.js src/jquery-plugin.js src/sequence-diagram.js src/theme.js src/theme-snap.js
	$(NODE_MODULES)/preprocess $< . -SNAP=true > $@

dist/sequence-diagram.css: src/sequence-diagram.css
	cp $< $@

# Minify the CSS
dist/sequence-diagram-min.css: dist/sequence-diagram.css
	$(NODE_MODULES)/minify --output $@ $<

# Move some fonts TODO optomise the fonts
dist/%.woff: fonts/daniel/%.woff
	cp $< $@

dist/%.woff2: fonts/daniel/%.woff2
	cp $< $@

# Minify the final javascript
dist/%-min.js dist/%-min.js.map: dist/%.js

	#
	# Please ignore the warnings below (these are in combined js code)
	#
	$(NODE_MODULES)/uglifyjs \
		$< -o $@ \
		--compress --comments --lint \
		--source-map $@.map \
		--source-map-url `basename $<`
