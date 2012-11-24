(function( $ ) {
	$.fn.sequenceDiagram = function( options ) {

		var settings = $.extend( {
			'theme' : 'hand',
		}, options);

		return this.each(function() {
			var $this = $(this);
			var diagram = Diagram.parse($this.val());
			// Blank the HTML
			$this.html('');
			diagram.drawSVG(this, settings);
		});
	};
})( jQuery );