/** js sequence diagrams
 *  https://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2017 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Raphael, _ */

if (typeof Raphael != 'undefined') {

  var LINE = {
    'stroke': '#000000',
    'stroke-width': 2,
    'fill': 'none'
  };

  var RECT = {
        'stroke': '#000000',
        'stroke-width': 2,
        'fill': '#fff'
      };

  /******************
   * Raphaël extras
   ******************/
  Raphael.fn.line = function(x1, y1, x2, y2) {
    assert(_.every([x1,x2,y1,y2], _.isFinite), 'x1,x2,y1,y2 must be numeric');
    return this.path('M{0},{1} L{2},{3}', x1, y1, x2, y2);
  };

  /******************
   * RaphaelTheme
   ******************/

  var RaphaelTheme = function(diagram, options, resume) {
        this.init(diagram, _.defaults(options, {
            'font-size': 16,
            'font-family': 'Andale Mono, monospace'
          }), resume);
      };

  _.extend(RaphaelTheme.prototype, BaseTheme.prototype, {

    init: function(diagram, options, resume) {
      BaseTheme.prototype.init.call(this, diagram);

      this.paper_  = undefined;
      this.font_   = {
                  'font-size': options['font-size'],
                  'font-family': options['font-family']
                };

      var a = this.arrowTypes_ = {};
      a[ARROWTYPE.FILLED] = 'block';
      a[ARROWTYPE.OPEN]   = 'open';

      var l = this.lineTypes_ = {};
      l[LINETYPE.SOLID]  = '';
      l[LINETYPE.DOTTED] = '-';

      resume(this);
    },

    setupPaper: function(container) {
      this.paper_ = new Raphael(container, 320, 200);
      this.paper_.setStart();
    },

    draw: function(container) {
      BaseTheme.prototype.draw.call(this, container);
      this.paper_.setFinish();
    },

    layout: function() {
      BaseTheme.prototype.layout.call(this);
      this.paper_.setSize(
       this.diagram.width,
       this.diagram.height
      );
    },

    /**
     * Strip whitespace from each newline
     */
    cleanText: function(text) {
      return text.split('\n').map(function(x) {
        return x.trim();
      }).join('\n');
    },

    /**
     * Returns the text's bounding box
     */
    textBBox: function(text, font) {
      text = this.cleanText(text);
      font = font || {};
      var p;
      if (font.obj_) {
        p = this.paper_.print(0, 0, text, font.obj_, font['font-size']);
      } else {
        p = this.paper_.text(0, 0, text);
        p.attr(font);
      }

      var bb = p.getBBox();
      p.remove();

      return bb;
    },

    drawLine: function(x1, y1, x2, y2, linetype, arrowhead) {
      var line = this.paper_.line(x1, y1, x2, y2).attr(LINE);
      if (arrowhead !== undefined) {
        line.attr('arrow-end', this.arrowTypes_[arrowhead] + '-wide-long');
      }
      if (arrowhead !== undefined) {
        line.attr('stroke-dasharray', this.lineTypes_[linetype]);
      }
      return line;
    },

    drawRect: function(x, y, w, h) {
      return this.paper_.rect(x, y, w, h).attr(RECT);
    },

    /**
     * Draws text with a optional white background
     * x,y (int) x,y top left point of the text, or the center of the text (depending on align param)
     * text (string) text to print
     * font (Object)
     * align (string) ALIGN_LEFT, ALIGN_CENTER, ALIGN_HORIZONTAL_CENTER or ALIGN_VERTICAL_CENTER
     */
    drawText: function(x, y, text, font, align) {
      text = this.cleanText(text);
      font = font || {};
      align = align || ALIGN_LEFT;

      var paper = this.paper_;
      var bb = this.textBBox(text, font);

      if (align == ALIGN_CENTER || align == ALIGN_HORIZONTAL_CENTER) {
        x = x - bb.width / 2;
      }
      if (align == ALIGN_CENTER || align == ALIGN_VERTICAL_CENTER) {
        y = y - bb.height / 2;
      }

      var t;
      if (font.obj_) {
        // When using a font, we have to use .print(..)
        t = paper.print(x - bb.x, y - bb.y, text, font.obj_, font['font-size']);
      } else {
        t = paper.text(x - bb.x - bb.width / 2, y - bb.y, text);
        t.attr(font);
        t.attr({'text-anchor': 'start'});
      }

      return t;
    }
  });

  /******************
   * RaphaelHandTheme
   ******************/

  var RaphaelHandTheme = function(diagram, options, resume) {
    this.init(diagram, _.defaults(options, {
              'font-size': 16,
              'font-family': 'daniel'
            }), resume);
  };

  // Take the standard RaphaelTheme and make all the lines wobbly
  _.extend(RaphaelHandTheme.prototype, RaphaelTheme.prototype, {
        setupPaper: function(container) {
            RaphaelTheme.prototype.setupPaper.call(this, container);
            this.font_.obj_ = this.paper_.getFont('daniel');
          },

        drawLine: function(x1, y1, x2, y2, linetype, arrowhead) {
          var line = this.paper_.path(handLine(x1, y1, x2, y2)).attr(LINE);
          if (arrowhead !== undefined) {
            line.attr('arrow-end', this.arrowTypes_[arrowhead] + '-wide-long');
          }
          if (arrowhead !== undefined) {
            line.attr('stroke-dasharray', this.lineTypes_[linetype]);
          }
          return line;
        },

        drawRect: function(x, y, w, h) {
          return this.paper_.path(handRect(x, y, w, h)).attr(RECT);
        }
      });

  registerTheme('raphaelSimple', RaphaelTheme);
  registerTheme('raphaelHand',   RaphaelHandTheme);
}
