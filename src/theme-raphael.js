/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Raphael, _ */

if (Raphael) {

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

	Raphael.fn.wobble = function(x1, y1, x2, y2) {
		assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");

		var wobble = Math.sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 25;

		// Distance along line
		var r1 = Math.random();
		var r2 = Math.random();

		var xfactor = Math.random() > 0.5 ? wobble : -wobble;
		var yfactor = Math.random() > 0.5 ? wobble : -wobble;

		var p1 = {
			x: (x2 - x1) * r1 + x1 + xfactor,
			y: (y2 - y1) * r1 + y1 + yfactor
		};

		var p2 = {
			x: (x2 - x1) * r2 + x1 - xfactor,
			y: (y2 - y1) * r2 + y1 - yfactor
		};

		return "C" + p1.x + "," + p1.y +
			" " + p2.x + "," + p2.y +
			" " + x2 + "," + y2;
	};

	/**
	 * Returns the text's bounding box
	 */
	Raphael.fn.text_bbox = function (text, font) {
		var p;
		if (font._obj) {
			p = this.print_center(0, 0, text, font._obj, font['font-size']);
		} else {
			p = this.text(0, 0, text);
			p.attr(font);
		}

		var bb = p.getBBox();
		p.remove();

		return bb;
	};

	/**
	 * Draws a wobbly (hand drawn) rect
	 */
	Raphael.fn.handRect = function (x, y, w, h) {
		assert(_.all([x, y, w, h], _.isFinite), "x, y, w, h must be numeric");
		return this.path("M" + x + "," + y +
			this.wobble(x, y, x + w, y) +
			this.wobble(x + w, y, x + w, y + h) +
			this.wobble(x + w, y + h, x, y + h) +
			this.wobble(x, y + h, x, y));
	};

	/**
	 * Draws a wobbly (hand drawn) line
	 */
	Raphael.fn.handLine = function (x1, y1, x2, y2) {
		assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
		return this.path("M" + x1 + "," + y1 + this.wobble(x1, y1, x2, y2));
	};

	/**
	 * Prints, but aligns text in a similar way to text(...)
	 */
	Raphael.fn.print_center = function(x, y, string, font, size, letter_spacing) {
		var path = this.print(x, y, string, font, size, 'baseline', letter_spacing);
		var bb = path.getBBox();

		// Translate the text so it's centered.
		var dx = (x - bb.x) - bb.width / 2;
		var dy = (y - bb.y) - bb.height / 2;

		// Due to an issue in Raphael 2.1.0 (that seems to be fixed later)
		// we remap the path itself, instead of using a transformation matrix
		var m = new Raphael.matrix();
		m.translate(dx, dy);
		return path.attr('path', Raphael.mapPath(path.attr('path'), m));

		// otherwise we would do this:
		//return path.transform("t" + dx + "," + dy);
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

		text_bbox: function(text, font) {
			return this._paper.text_bbox(text, font);
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.line(x1, y1, x2, y2);
			if (arrowhead != undefined) {
				line.attr('arrow-end', this.arrow_types[arrowhead] + '-wide-long');
			}
			if (arrowhead != undefined) {
				line.attr('stroke-dasharray', this.line_types[linetype]);
			}
			return line;
		},

		draw_rect : function(x, y, w, h) {
			return this._paper.rect(x, y, w, h).attr(RECT);
		},

		/**
		 * Draws text with a white background
		 * x,y (int) x,y center point for this text
		 * TODO Horz center the text when it's multi-line print
		 */
		draw_text : function (x, y, text, font) {
			var paper = this._paper;
			var f = font || {};
			var t;
			if (f._obj) {
				// When using a font, we use a different text method, to ensure text is correctly aligned.
				t = paper.print_center(x, y, text, f._obj, f['font-size']);
			} else {
				t = paper.text(x, y, text);
				t.attr(f);
			}
			// draw a rect behind it. TODO Remove this rect if this text is already in a box
			var bb = t.getBBox();
			var r = paper.rect(bb.x, bb.y, bb.width, bb.height);
			r.attr(RECT).attr({'stroke': 'none'});
			t.toFront();
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
			var line = this._paper.handLine(x1, y1, x2, y2).attr(LINE);
			if (arrowhead != undefined) {
				line.attr('arrow-end', this.arrow_types[arrowhead] + '-wide-long');
			}
			if (arrowhead != undefined) {
				line.attr('stroke-dasharray', this.line_types[linetype]);
			}
			return line;
		},

		draw_rect : function(x, y, w, h) {
			return this._paper.handRect(x, y, w, h).attr(RECT);
		}
	});

	registerTheme("oldSimple", RaphaelTheme);
	registerTheme("oldHand",   RaphaelHandTheme);
}