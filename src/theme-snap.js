/** js sequence diagrams
 *  http://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2015 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, Snap, WebFont _ */
// TODO Move defintion of font onto the <svg>, so it can easily be override at each level
if (typeof Snap != 'undefined') {

	var xmlns = "http://www.w3.org/2000/svg";

	var LINE = {
		'stroke': '#000000',
		'stroke-width': 2, // BUG TODO This gets set as a style, not as a attribute. Look at  eve.on("snap.util.attr"...
        'fill': 'none'
	};

	var RECT = {
        'stroke': '#000000',
        'stroke-width': 2,
		'fill': "#fff"
	};

	var LOADED_FONTS = {};

	/******************
	 * SnapTheme
	 ******************/

	var SnapTheme = function(diagram, options, resume) {
        _.defaults(options, {
            'css-class': 'simple',
            'font-size': 16,
            'font-family': 'Andale Mono, monospace'
        });

        this.init(diagram, options, resume);
	};

	_.extend(SnapTheme.prototype, BaseTheme.prototype, {

		init : function(diagram, options, resume) {
			BaseTheme.prototype.init.call(this, diagram);

			this._paper  = undefined;
            this._css_class = options['css-class'] || undefined;
            this._font = {
                'font-size': options['font-size'],
                'font-family': options['font-family']
            };

			var a = this.arrow_types = {};
			a[ARROWTYPE.FILLED] = 'Block';
			a[ARROWTYPE.OPEN]   = 'Open';

			var l = this.line_types = {};
 			l[LINETYPE.SOLID]  = '';
			l[LINETYPE.DOTTED] = '6,2';

			var that = this;
            this.wait_for_font(function() {
            	resume(that);
			});
        },

		// Wait for loading of the font
        wait_for_font: function(callback) {
			var font_family = this._font['font-family'];

            if (typeof WebFont == 'undefined') {
            	throw new Error("WebFont is required (https://github.com/typekit/webfontloader).");
            }

            WebFont.load({
                custom: {
                    families: [font_family] // TODO replace this with something that reads the css
                },
                classes: false, // No need to place classes on the DOM, just use JS Events
                active: function () {
                    LOADED_FONTS[font_family] = true;
                    callback();
                },
                inactive: function () {
                    // If we fail to fetch the font, still continue.
                    LOADED_FONTS[font_family] = true;
                    callback();
                }
            });
        },

    	add_description: function(svg, description) {
            var desc = document.createElementNS(xmlns, 'desc');
            desc.appendChild(document.createTextNode(description));
            svg.appendChild(desc);
		},

		setup_paper: function (container) {
			// Container must be a SVG element. We assume it's a div, so lets create a SVG and insert
            var svg = document.createElementNS(xmlns, 'svg');
            container.appendChild(svg);

            this.add_description(svg, this.diagram.title || '');

			this._paper = Snap(svg);
			this._paper.addClass("sequence");

			if (this._css_class) {
                this._paper.addClass(this._css_class);
            }

			this.begin_group();

			// TODO Perhaps only include the markers if we actually use them.
			var a = this.arrow_markers = {};
			var arrow = this._paper.path("M 0 0 L 5 2.5 L 0 5 z");
			a[ARROWTYPE.FILLED] = arrow.marker(0, 0, 5, 5, 5, 2.5)
				.attr({ id: "markerArrowBlock" });

			arrow = this._paper.path("M 9.6,8 1.92,16 0,13.7 5.76,8 0,2.286 1.92,0 9.6,8 z");
			a[ARROWTYPE.OPEN] = arrow.marker(0, 0, 9.6, 16, 9.6, 8)
				.attr({ markerWidth: "4", id: "markerArrowOpen" });
		},

		layout : function() {
			BaseTheme.prototype.layout.call(this);
			this._paper.attr({
				width:  this.diagram.width + 'px',
				height: this.diagram.height + 'px'
			});
		},

		text_bbox: function(text, font) {
			// TODO getBBox will return the bounds with any whitespace/kerning. This makes some of our aligments screwed up
			var t = this.create_text(text, font);
			var bb = t.getBBox();
			t.remove();
			return bb;
		},

		// For each drawn element, push onto the stack, so it can be wrapped in a single outer element
		push_to_stack: function(element) {
			this._stack.push(element);
			return element;
		},

		// Begin a group of elements
		begin_group: function() {
			this._stack = [];
		},

		// Finishes the group, and returns the <group> element
		finish_group: function() {
			var g = this._paper.group.apply(this._paper, this._stack);
			this.begin_group(); // Reset the group
			return g;
		},

		create_text: function(text, font) {
			text = _.invoke(text.split("\n"), 'trim');
			var t = this._paper.text(0, 0, text);
			t.attr(font || {});
			if (text.length > 1) {
				// Every row after the first, set tspan to be 1.2em below the previous line
				t.selectAll("tspan:nth-child(n+2)").attr({
					dy: "1.2em",
					x: 0
				});
			}

			return t;
		},

		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.line(x1, y1, x2, y2).attr(LINE);
			if (arrowhead !== undefined) {
				line.attr('markerEnd', this.arrow_markers[arrowhead]);
			}
			if (arrowhead !== undefined) {
				line.attr('strokeDasharray', this.line_types[linetype]);
			}
			return this.push_to_stack(line);
		},

		draw_rect : function(x, y, w, h) {
			var rect = this._paper.rect(x, y, w, h).attr(RECT);
			return this.push_to_stack(rect);
		},

		/**
		 * Draws text with a optional white background
		 * x,y (int) x,y top left point of the text, or the center of the text (depending on align param)
		 * text (string) text to print
		 * font (Object)
		 * align (string) ALIGN_LEFT or ALIGN_CENTER
		 */
		draw_text : function (x, y, text, font, align) {
			var t = this.create_text(text, font);
			var bb = t.getBBox();

			if (align == ALIGN_CENTER) {
				x = x - bb.width / 2;
				y = y - bb.height / 2;
			}

			// Now move the text into place
			// `y - bb.y` because text(..) is positioned from the baseline, so this moves it down.
			t.attr({x: x - bb.x, y: y - bb.y});
			t.selectAll("tspan").attr({x: x});

			this.push_to_stack(t);
			return t;
		},

		draw_title : function() {	
			this.begin_group();
			BaseTheme.prototype.draw_title.call(this);
			return this.finish_group().addClass('title');
		},

		draw_actor : function (actor, offsetY, height) {
			this.begin_group();
			BaseTheme.prototype.draw_actor.call(this, actor, offsetY, height);
			return this.finish_group().addClass('actor');
		},

		draw_signal : function (signal, offsetY) {
			this.begin_group();
			BaseTheme.prototype.draw_signal.call(this, signal, offsetY);
			return this.finish_group().addClass('signal');
		},

		draw_self_signal : function(signal, offsetY) {
			this.begin_group();
			BaseTheme.prototype.draw_self_signal.call(this, signal, offsetY);
			return this.finish_group().addClass('signal');
		},

		draw_note : function (note, offsetY) {
			this.begin_group();
			BaseTheme.prototype.draw_note.call(this, note, offsetY);
			return this.finish_group().addClass('note');
		},
	});

	/******************
	 * SnapHandTheme
	 ******************/

	var SnapHandTheme = function(diagram, options, resume) {
        _.defaults(options, {
            'css-class': 'hand',
            'font-size': 16,
            'font-family': 'danielbd'
        });

        this.init(diagram, options, resume);
	};

	// Take the standard SnapTheme and make all the lines wobbly
	_.extend(SnapHandTheme.prototype, SnapTheme.prototype, {
		draw_line : function(x1, y1, x2, y2, linetype, arrowhead) {
			var line = this._paper.path(handLine(x1, y1, x2, y2)).attr(LINE);
			if (arrowhead !== undefined) {
				line.attr('markerEnd', this.arrow_markers[arrowhead]);
			}
			if (arrowhead !== undefined) {
				line.attr('strokeDasharray', this.line_types[linetype]);
			}
			return this.push_to_stack(line);
		},

		draw_rect : function(x, y, w, h) {
			var rect = this._paper.path(handRect(x, y, w, h)).attr(RECT);
			return this.push_to_stack(rect);
		}
	});

	registerTheme("snapSimple", SnapTheme);
	registerTheme("snapHand",   SnapHandTheme);
}
