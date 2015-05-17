.PHONY : all

BOWER_COMPONENTS := bower_components

all: bower_components

bower_components: bower.json
	#
	# Bower update needed.
	#
	bower update
	cp bower_components/underscore/underscore-min.js js/
	cp bower_components/raphael/raphael-min.js js/
	cp bower_components/js-sequence-diagrams/build/sequence-diagram-min.js js/
	cp bower_components/js-sequence-diagrams/build/sequence-diagram-min.js.map js/
	cp bower_components/jquery/jquery.min.js js/