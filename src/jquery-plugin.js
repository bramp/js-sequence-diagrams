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