/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Raphael, _ */

if (typeof Raphael != 'undefined') {

	var LINE = {
		'stroke': '#000000',
		'stroke-width': 2
	};

	var RECT = _.extend(LINE, {
		'fill': "#fff"
	});

	/******************
	 * Raphaël extras
	 ******************/
	Raphael.fn.line = function(x1, y1, x2, y2) {
		assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
		return this.path("M{0},{1} L{2},{3}", x1, y1, x2, y2).attr(LINE);
	};


	/******************
	 * RaphaelTheme
	 ******************/

	var RaphaelTheme = function(diagram) {
		this.init(diagram);
	};

	_.extend(RaphaelTheme.prototype, BaseTheme.prototype, {

		init : function(diagram, css_class) {
			BaseTheme.prototype.init.call(this, diagram);

			this._paper  = undefined;
			this._font   = undefined;
			this._css_class = css_class;

			var a = this.arrow_types = {};
			a[ARROWTYPE.FILLED] = 'block';
			a[ARROWTYPE.OPEN]   = 'open';

			var l = this.line_types = {};
 			l[LINETYPE.SOLID]  = '';
			l[LINETYPE.DOTTED] = '-';
		},

		init_font : function() {
			this._font = {
				'font-size': 16,
				'font-family': 'Andale Mono, monospace'
			};
		},

		init_paper: function (container) {
			this._paper = new Raphael(container, 320, 200);
			this._paper.setStart();
		},

		draw : function(container) {
			BaseTheme.prototype.draw.call(this, container);
			this._paper.setFinish();
		},

		layout : function() {
			BaseTheme.prototype.layout.call(this);
			this._paper.setSize(
				this.diagram.width,
				this.diagram.height
			);
		},

		/**
		 * Strip whitespace from each newline
		 */
		clean_text: function(text) {
			text = _.invoke(text.split("\n"), 'trim');
			return text.join("\n");
		},

		/**
		 * Returns the text's bounding box
		 */
		text_bbox: function(text, font) {
			text = this.clean_text(text);
			font = font || {};
			var p;
			if (font._obj) {
				p = this._paper.print(0, 0, text, font._obj, font['font-size']);
			} else {
				p = this._paper.text(0, 0, text);
				p.attr(font);
				//p.attr({"text-anchor": "start"});
			}

			var bb = p.getBBox();
			p.remove();

			return bb;
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.line(x1, y1, x2, y2);
			if (arrowhead !== undefined) {
				line.attr('arrow-end', this.arrow_types[arrowhead] + '-wide-long');
			}
			if (arrowhead !== undefined) {
				line.attr('stroke-dasharray', this.line_types[linetype]);
			}
			return line;
		},

		draw_rect : function(x, y, w, h) {
			return this._paper.rect(x, y, w, h).attr(RECT);
		},

		/**
		 * Draws text with a optional white background
		 * x,y (int) x,y top left point of the text, or the center of the text (depending on align param)
		 * text (string) text to print
		 * font (Object)
		 * background (boolean) draw a white background behind the text
		 * align (string) ALIGN_LEFT or ALIGN_CENTER
		 */
		draw_text : function (x, y, text, font, background, align) {
			text = this.clean_text(text);
			font = font || {};
			align = align || ALIGN_LEFT;

			var paper = this._paper;
			var bb = this.text_bbox(text, font);

			if (align == ALIGN_CENTER) {
				x = x - bb.width / 2;
				y = y - bb.height / 2;
			}

			var t;
			if (font._obj) {
				// When using a font, we have to use .print(..)
				t = paper.print(x - bb.x, y - bb.y, text, font._obj, font['font-size']);
			} else {
				t = paper.text(x - bb.x - bb.width / 2, y - bb.y, text);
				t.attr(font);
				t.attr({"text-anchor": "start"});
			}

			if (background) {
				// draw a rect behind the text
				var r = paper.rect(x, y, bb.width, bb.height);
				r.attr(RECT).attr({'stroke': 'none'});
				t.toFront();
			}
			return t;
		},
	});

	/******************
	 * RaphaelHandTheme
	 ******************/

	var RaphaelHandTheme = function(diagram) {
		this.init(diagram);
	};

	// Take the standard RaphaelTheme and make all the lines wobbly
	_.extend(RaphaelHandTheme.prototype, RaphaelTheme.prototype, {
		init_font : function() {
			this._font = {
				'font-size': 16,
				'font-family': 'daniel'
			};

			this._font._obj = this._paper.getFont('daniel');
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.path(handLine(x1, y1, x2, y2)).attr(LINE);
			if (arrowhead !== undefined) {
				line.attr('arrow-end', this.arrow_types[arrowhead] + '-wide-long');
			}
			if (arrowhead !== undefined) {
				line.attr('stroke-dasharray', this.line_types[linetype]);
			}
			return line;
		},

		draw_rect : function(x, y, w, h) {
			return this._paper.path(handRect(x, y, w, h)).attr(RECT);
		}
	});

	registerTheme("oldSimple", RaphaelTheme);
	registerTheme("oldHand",   RaphaelHandTheme);
}