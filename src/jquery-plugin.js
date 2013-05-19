/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2013 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
if (typeof jQuery != 'undefined') {
	(function( $ ) {
		$.fn.sequenceDiagram = function( options ) {
			return this.each(function() {
				var $this = $(this);
				var diagram = Diagram.parse($this.text());
				$this.html('');
				diagram.drawSVG(this, options);
			});
		};
	})( jQuery );
}