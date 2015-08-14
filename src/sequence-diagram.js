/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2013 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, SnapTheme, SnapHandTheme */

Diagram.themes = themes;

// Draws the diagram. Creates a SVG inside the container
Diagram.prototype.drawSVG = function (container, options) {
	var default_options = {
		theme: 'hand'
	};

	options = _.defaults(options || {}, default_options);

	if (!(options.theme in themes))
		throw new Error("Unsupported theme: " + options.theme);

	var drawing = new themes[options.theme](this);
	drawing.draw(container);

}; // end of drawSVG

