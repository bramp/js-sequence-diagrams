/** js sequence diagrams
 *  https://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2017 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, _ */

if (typeof Raphael == 'undefined' && typeof Snap == 'undefined') {
  throw new Error('Raphael or Snap.svg is required to be included.');
}

if (_.isEmpty(Diagram.themes)) {
  // If you are using stock js-sequence-diagrams you should never see this. This only
  // happens if you have removed the built in themes.
  throw new Error('No themes were registered. Please call registerTheme(...).');
}

// Set the default hand/simple based on which theme is available.
Diagram.themes.hand = Diagram.themes.snapHand || Diagram.themes.raphaelHand;
Diagram.themes.simple = Diagram.themes.snapSimple || Diagram.themes.raphaelSimple;

/* Draws the diagram. Creates a SVG inside the container
* container (HTMLElement|string) DOM element or its ID to draw on
* options (Object)
*/
Diagram.prototype.drawSVG = function(container, options) {
  var defaultOptions = {
    theme: 'hand'
  };

  options = _.defaults(options || {}, defaultOptions);

  if (!(options.theme in Diagram.themes)) {
    throw new Error('Unsupported theme: ' + options.theme);
  }

  // TODO Write tests for this check
  var div = _.isString(container) ? document.getElementById(container) : container;
  if (div === null || !div.tagName) {
    throw new Error('Invalid container: ' + container);
  }

  var Theme = Diagram.themes[options.theme];
  new Theme(this, options, function(drawing) {
      drawing.draw(div);
    });
}; // end of drawSVG
