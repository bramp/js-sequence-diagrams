/** js sequence diagrams
 *  https://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2017 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global jQuery */
if (typeof jQuery != 'undefined') {
  (function($) {
    $.fn.sequenceDiagram = function(options) {
      return this.each(function() {
        var $this = $(this);
        var diagram = Diagram.parse($this.text());
        $this.html('');
        diagram.drawSVG(this, options);
      });
    };
  })(jQuery);
}
