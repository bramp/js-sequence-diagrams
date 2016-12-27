.PHONY : all

BOWER_COMPONENTS := bower_components

all: bower_components

bower_components: bower.json
	# Bower update needed
	bower update

	cp bower_components/underscore/underscore-min.js js/
	cp bower_components/snap.svg/dist/snap.svg-min.js js/
	cp bower_components/jquery/dist/jquery.min.js js/
	cp bower_components/bower-webfontloader/webfont.js js/

	# Sequence diagram
	cp bower_components/js-sequence-diagrams/dist/sequence-diagram-min.js js/
	cp bower_components/js-sequence-diagrams/dist/sequence-diagram-min.js.map js/
	cp bower_components/js-sequence-diagrams/dist/sequence-diagram-snap-min.js js/
	cp bower_components/js-sequence-diagrams/dist/sequence-diagram-snap-min.js.map js/

	cp bower_components/js-sequence-diagrams/dist/sequence-diagram-min.css css/
	cp bower_components/js-sequence-diagrams/dist/danielbd.woff css/
	cp bower_components/js-sequence-diagrams/dist/danielbd.woff2 css/
