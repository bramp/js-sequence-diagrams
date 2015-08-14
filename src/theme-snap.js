/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Snap, _ */

if (Snap) {

	var LINE = {
		'stroke': '#000000',
		'stroke-width': 2
	};

	var RECT = _.extend(LINE, {
		'fill': "#fff"
	});

	/******************
	 * Snap extras
	 ******************/
	Snap.plugin(function (Snap, Element, Paper, global, Fragment) {

		Element.prototype.wobble = function (x1, y1, x2, y2) {
			assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");

			var wobble = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 25;

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
		 * TODO Is this method needed with Snap?
		 */
		Element.prototype.text_bbox = function (text, font) {
			var p;
			text = text.split("\n");
			if (font._obj) {
				p = this.print_center(0, 0, text, font._obj, font['font-size']);
			} else {
				p = this.text(0, 0, text);
				p.attr(font);
			}
			if (text.length > 1) {
				p.selectAll("tspan:nth-child(n+2)").attr({
					dy: "1.2em",
					x: 0
				});
			}

			var bb = p.getBBox();
			p.remove();

			return bb;
		};

		/**
		 * Draws a wobbly (hand drawn) rect
		 */
		Element.prototype.handRect = function (x, y, w, h) {
			assert(_.all([x, y, w, h], _.isFinite), "x, y, w, h must be numeric");
			return this.path("M" + x + "," + y +
				this.wobble(x, y, x + w, y) +
				this.wobble(x + w, y, x + w, y + h) +
				this.wobble(x + w, y + h, x, y + h) +
				this.wobble(x, y + h, x, y))
				.attr(RECT);
		};

		/**
		 * Draws a wobbly (hand drawn) line
		 */
		Element.prototype.handLine = function (x1, y1, x2, y2) {
			assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
			return this.path("M" + x1 + "," + y1 + this.wobble(x1, y1, x2, y2));
		};

		/**
		 * Prints, but aligns text in a similar way to text(...)
		 */
		Element.prototype.print_center = function (x, y, string, font, size, letter_spacing) {
			var path = this.print(x, y, string, font, size, 'baseline', letter_spacing);
			var bb = path.getBBox();

			// Translate the text so it's centered.
			var dx = (x - bb.x) - bb.width / 2;
			var dy = (y - bb.y) - bb.height / 2;

			// TODO Remove Raphael
			// Due to an issue in Raphael 2.1.0 (that seems to be fixed later)
			// we remap the path itself, instead of using a transformation matrix
			var m = new Raphael.matrix();
			m.translate(dx, dy);
			return path.attr('path', Raphael.mapPath(path.attr('path'), m));

			// otherwise we would do this:
			//return path.transform("t" + dx + "," + dy);
		};
	});


	/******************
	 * SnapTheme
	 ******************/

	var SnapTheme = function(diagram) {
		this.init(diagram, 'simple');
	};

	_.extend(SnapTheme.prototype, BaseTheme.prototype, {

		init : function(diagram, css_class) {
			BaseTheme.prototype.init.call(this, diagram);

			this._paper  = undefined;
			this._font   = undefined;
			this._css_class = css_class;

			var a = this.arrow_types = {};
			a[ARROWTYPE.FILLED] = 'Block';
			a[ARROWTYPE.OPEN]   = 'Open';

			var l = this.line_types = {};
 			l[LINETYPE.SOLID]  = '';
			l[LINETYPE.DOTTED] = '6,2';
		},

		init_paper: function (container) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            container.appendChild(svg);

			this._paper = Snap(svg);
			this._paper.clear();
			this._paper.addClass("sequence");
			this._paper.addClass(this._css_class);

			var a = this.arrow_markers = {};
			var arrow = this._paper.path("M 0 0 L 5 2.5 L 0 5 z");
			var marker = arrow.marker(0, 0, 5, 5, 5, 2.5);
			marker.attr({ id: "markerArrowBlock" });
			a[ARROWTYPE.FILLED] = marker;

			arrow = this._paper.path("M 9.6,8 1.92,16 0,13.7 5.76,8 0,2.286 1.92,0 9.6,8 z");
			marker = arrow.marker(0, 0, 9.6, 16, 9.6, 8);
			marker.attr({ markerWidth: "4", id: "markerArrowOpen" });
			a[ARROWTYPE.OPEN] = marker;
		},

		init_font : function() {
			this._font = {
				//'font-size': 16,
				//'font-family': 'daniel'
			};
		},

		layout : function() {
			BaseTheme.prototype.layout.call(this);
			this._paper.attr({
				width:  this.diagram.width + 'px',
				height: this.diagram.height + 'px'
			});
		},

		text_bbox: function(text, font) {
			return this._paper.text_bbox(text, font);
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.line(x1, y1, x2, y2).attr(LINE);
			if (arrowhead != undefined) {
				line.attr('markerEnd', this.arrow_markers[arrowhead]);
			}
			if (arrowhead != undefined) {
				line.attr('strokeDasharray', this.line_types[linetype]);
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
		 * TODO Determine what the group param is for
		 */
		draw_text : function (x, y, text, font, group) {
			var paper = this._paper;
			var f = font || {};
			var t;
			text = text.split("\n");

			if (f._obj) {
				t = paper.print_center(x, y, text, f._obj, f['font-size']);
			} else {
				t = paper.text(0, y, text);
				t.attr(f);
			}
			t.attr({ dy: "1em" });
			if (text.length > 1) {
				t.selectAll("tspan:nth-child(n+2)").attr({
					dy: "1.2em",
					x: 0
				});
			}

			// draw a rect behind it
			var bb = t.getBBox();

			x = x - bb.width / 2;
			y = y - bb.height / 2;
			t.attr({ x: x, y: y });
			if (text.length > 1) {
				t.selectAll("tspan:nth-child(n+2)").attr({
					dy: "1.2em",
					x: x
				});
			}
			var r = paper.rect(x, y, bb.width, bb.height);
			r.attr({'stroke': 'none'});

			if (group) {
				group.add(r);
				group.add(t);
			} else {
				t.before(r);
			}
		},

		draw_title : function() {	
			var title = this._title;
			if (title) {
				var group = this._paper.group();
				group.attr({ 'class': 'title' });
				this.draw_text_box(title, title.message, TITLE_MARGIN, TITLE_PADDING, this._font, group);
			}
		},

		draw_actor : function (actor, offsetY, height) {
			actor.y      = offsetY;
			actor.height = height;
			var group = this._paper.group();
			group.attr({ 'class': 'actor' });
			this.draw_text_box(actor, actor.name, ACTOR_MARGIN, ACTOR_PADDING, this._font, group);
		},
	});

	/******************
	 * SnapHandTheme
	 ******************/

	var SnapHandTheme = function(diagram) {
		this.init(diagram, "hand");
	};

	// Take the standard SnapTheme and make all the lines wobbly
	_.extend(SnapHandTheme.prototype, SnapTheme.prototype, {
		init_font : function() {
			this._font = {
				//'font-size': 16,
				//'font-family': 'daniel'
			};
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.handLine(x1, y1, x2, y2).attr(LINE);
			if (arrowhead != undefined) {
				line.attr('markerEnd', this.arrow_markers[arrowhead]);
			}
			if (arrowhead != undefined) {
				line.attr('strokeDasharray', this.line_types[linetype]);
			}
			return line;
		},

		draw_rect : function(x, y, w, h) {
			return this._paper.handRect(x, y, w, h);
		},
	});

	registerTheme("simple", SnapTheme);
	registerTheme("hand",   SnapHandTheme);
}