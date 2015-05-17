/** js sequence diagrams 1.0.6
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  @license Simplified BSD license.
 */
(function () {
	"use strict";
	/*global Diagram */

	/*> ../build/diagram-grammar.js */
	/*> ../fonts/daniel/daniel_700.font.js */
	/*> sequence-diagram.js */
	/*> jquery-plugin.js */

	// Taken from what underscore.js:
	// Establish the root object, `window` (`self`) in the browser, or `global` on the server.
	// We use `self` instead of `window` for `WebWorker` support.
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);

	// Export the Diagram object for **Node.js**, with
	// backwards-compatibility for their old module API. If we're in
	// the browser, add `Diagram` as a global object.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Diagram;
		}
		exports.Diagram = Diagram;
	} else {
		root.Diagram = Diagram;
	}

}());
