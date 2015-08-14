/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Snap, _ */
// TODO Move defintion of font onto the <svg>, so it can easily be override at each level
if (Snap) {
	var xmlns = "http://www.w3.org/2000/svg";

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
			// TODO We can share code between this and draw_text
			text = text.split("\n");
			var p = this.text(0, 0, text);
			p.attr(font);
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
				this.wobble(x, y + h, x, y));
		};

		/**
		 * Draws a wobbly (hand drawn) line
		 */
		Element.prototype.handLine = function (x1, y1, x2, y2) {
			assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
			return this.path("M" + x1 + "," + y1 + this.wobble(x1, y1, x2, y2));
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

		add_description: function(svg, description) {
            var desc = document.createElementNS(xmlns, 'desc')
            desc.appendChild(document.createTextNode(description));
            svg.appendChild(desc);
		},

		init_paper: function (container) {
            var svg = document.createElementNS(xmlns, 'svg');
            container.appendChild(svg);

            this.add_description(svg, this.diagram.title || '');

			this._paper = Snap(svg);
			this._paper.addClass("sequence");
			this._paper.addClass(this._css_class);

			this.clear_group();

			var a = this.arrow_markers = {};
			var arrow = this._paper.path("M 0 0 L 5 2.5 L 0 5 z");
			a[ARROWTYPE.FILLED] = arrow.marker(0, 0, 5, 5, 5, 2.5)
				.attr({ id: "markerArrowBlock" });

			arrow = this._paper.path("M 9.6,8 1.92,16 0,13.7 5.76,8 0,2.286 1.92,0 9.6,8 z");
			a[ARROWTYPE.OPEN] = arrow.marker(0, 0, 9.6, 16, 9.6, 8)
				.attr({ markerWidth: "4", id: "markerArrowOpen" });
		},

		init_font : function() {
			this._font = {
				'font-size': 16,
				'font-family': 'Andale Mono, monospace'
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

		push_to_stack: function(element) {
			this._stack.push(element);
			return element
		},

		clear_group: function() {
			this._stack = new Array();
		},

		finish_group: function() {
			var g = this._paper.group.apply(this._paper, this._stack);
			this.clear_group();
			return g;
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.line(x1, y1, x2, y2).attr(LINE);
			if (arrowhead != undefined) {
				line.attr('markerEnd', this.arrow_markers[arrowhead]);
			}
			if (arrowhead != undefined) {
				line.attr('strokeDasharray', this.line_types[linetype]);
			}
			return this.push_to_stack(line);
		},

		draw_rect : function(x, y, w, h) {
			var rect = this._paper.rect(x, y, w, h).attr(RECT);
			return this.push_to_stack(rect);
		},

		/**
		 * Draws text with a white background
		 * x,y (int) x,y center point for this text
		 * TODO Horz center the text when it's multi-line print
		 * TODO Determine what the group param is for
		 */
		draw_text : function (x, y, text, font, background) {
			var paper = this._paper;
			var f = font || {};
			text = text.split("\n");

			var t = paper.text(0, y, text);
			t.attr(f).attr({ dy: "1em" });
			if (text.length > 1) {
				t.selectAll("tspan:nth-child(n+2)").attr({
					dy: "1.2em",
					x: 0
				});
			}

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

			// draw a rect behind it. TODO This is not needed if the text is within a box already!
			if (background) {
				var r = paper.rect(x, y, bb.width, bb.height);
				r.attr(RECT).attr({'stroke': 'none'});
				this.push_to_stack(r);
			}

			this.push_to_stack(t);
			return t;
		},

		draw_title : function() {	
			this.clear_group();
			BaseTheme.prototype.draw_title.call(this);
			return this.finish_group().addClass('title');
		},

		draw_actor : function (actor, offsetY, height) {
			this.clear_group();
			BaseTheme.prototype.draw_actor.call(this, actor, offsetY, height);
			return this.finish_group().addClass('actor');
		},

		draw_signal : function (signal, offsetY) {
			this.clear_group();
			BaseTheme.prototype.draw_signal.call(this, signal, offsetY);
			return this.finish_group().addClass('signal');
		},

		draw_self_signal : function(signal, offsetY) {
			this.clear_group();
			BaseTheme.prototype.draw_self_signal.call(this, signal, offsetY);
			return this.finish_group().addClass('signal');
		},

		draw_note : function (note, offsetY) {
			this.clear_group();
			BaseTheme.prototype.draw_note.call(this, note, offsetY);
			return this.finish_group().addClass('note');
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
				'font-size': 16,
				'font-family': 'daniel'
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
			return this.push_to_stack(line);
		},

		draw_rect : function(x, y, w, h) {
			var rect = this._paper.handRect(x, y, w, h).attr(RECT);
			return this.push_to_stack(rect);
		},
	});

	registerTheme("simple", SnapTheme);
	registerTheme("hand",   SnapHandTheme);
}