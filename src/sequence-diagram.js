/** js sequence diagrams 0.9
 *  http://bramp.github.com/js-sequence-diagrams/
 *  (c) 2012 Andrew Brampton (bramp.net)
 *  @license Simplified BSD license.
 */

// The following are included by jspp
/*> diagram.js */
/*> jquery-plugin.js */
/*> ../fonts/daniel/daniel_700.font.js */

(function () {
	"use strict";
	/*global Diagram, Raphael, _ */

	// Following the CSS convention
	// Margin is the gap outside the box
	// Padding is the gap inside the box
	// Each object has x/y/width/height properties
	// The x/y should be top left corner
	// width/height is with both margin and padding

	// TODO
	// Move these padding/margin into the objects as fields
	// Image width is wrong, when there is a note in the right hand col
	// The text is not correctly centered in some cases
	// Title box could look better
	// Note box could look better
	// Note "over" is not centered correctly
	// Note "over" should handle multiple actors

	var DIAGRAM_MARGIN = 10;

	var ACTOR_MARGIN   = 10; // Margin around a actor
	var ACTOR_PADDING  = 10; // Padding inside a actor

	var SIGNAL_MARGIN  = 5; // Margin around a signal
	var SIGNAL_PADDING = 5; // Padding inside a signal

	var NOTE_MARGIN   = 10; // Margin around a note
	var NOTE_PADDING  = 5; // Padding inside a note

	var TITLE_MARGIN   = 0;
	var TITLE_PADDING  = 5;

	var PLACEMENT = Diagram.PLACEMENT;
	var LINETYPE  = Diagram.LINETYPE;
	var ARROWTYPE = Diagram.ARROWTYPE;

	var FONT = {
		'font-size': 18,
		'font-family': 'daniel'
	};

	var LINE = {
		'stroke': '#000',
		'stroke-width': 2
	};

	var RECT = {
		'fill': "#fff"
	}

	function AssertException(message) { this.message = message; }
	AssertException.prototype.toString = function () {
		return 'AssertException: ' + this.message;
	};

	function assert(exp, message) {
		if (!exp) {
			throw new AssertException(message);
		}
	}

	if (!String.prototype.trim) {
		String.prototype.trim=function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

	Raphael.fn.line = function(x1, y1, x2, y2) {
		assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
		return this.path("M{0},{1} L{2},{3}", x1, y1, x2, y2);
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
		var p = this.print(0, 0, text, font, 16, 'middle');
		var bb = p.getBBox();
		p.remove();
		return bb;
	};

	Raphael.fn.handRect = function (x, y, w, h) {
		assert(_.all([x, y, w, h], _.isFinite), "x, y, w, h must be numeric");
		return this.path("M" + x + "," + y +
			this.wobble(x, y, x + w, y) +
			this.wobble(x + w, y, x + w, y + h) +
			this.wobble(x + w, y + h, x, y + h) +
			this.wobble(x, y + h, x, y))
			.attr(RECT);
	};

	Raphael.fn.handLine = function (x1, y1, x2, y2) {
		assert(_.all([x1,x2,y1,y2], _.isFinite), "x1,x2,y1,y2 must be numeric");
		return this.path("M" + x1 + "," + y1 + this.wobble(x1, y1, x2, y2));
	};

	Diagram.prototype.drawSVG = function (container) {

		// Local copies
		var actors  = this.actors;
		var signals = this.signals;

		var paper = new Raphael(container, 320, 200);
		var font = paper.getFont('daniel');

		var diagram_width = 0; // min width
		var diagram_height = 0; // min width

		// Setup some layout stuff
		var title = {x:0, y:0, width:0, height:0};
		if (this.title) {
			var bb = paper.text_bbox(this.title, font);
			title.text_bb = bb;
			title.message = this.title;

			title.width  = bb.width  + (TITLE_PADDING + TITLE_MARGIN) * 2;
			title.height = bb.height + (TITLE_PADDING + TITLE_MARGIN) * 2;
			title.x = DIAGRAM_MARGIN;
			title.y = DIAGRAM_MARGIN;// + title.height / 2;

			diagram_width = title.width;
		}

		var actors_height = 0;
		_.each(actors, function(a) {
			var bb = paper.text_bbox(a.name, font);
			a.text_bb = bb;

			//var bb = t.attr("text", a.name).getBBox();
			a.x = 0; a.y = 0;
			a.width  = bb.width  + (ACTOR_PADDING + ACTOR_MARGIN) * 2;
			a.height = bb.height + (ACTOR_PADDING + ACTOR_MARGIN) * 2;

			a.distances = [];
			a.padding_right = 0;
			actors_height = Math.max(a.height, actors_height);
		});

		function actor_ensure_distance(a, b, d) {
			assert(a < b, "a must be less than or equal to b");

			if (a < 0) {
				// Ensure b has left margin
				b = actors[b];
				b.x = Math.max(d - b.width / 2, b.x);
			} else if (b >= actors.length) {
				// Ensure a has right margin
				a = actors[a];
				a.padding_right = Math.max(d, a.padding_right);
			} else {
				a = actors[a];
				a.distances[b] = Math.max(d, a.distances[b] ? a.distances[b] : 0);
			}
		}

		var signals_height = 0;
		_.each(signals, function(s) {
			var a, b; // Indexes of the left and right actors involved

			var bb = paper.text_bbox(s.message, font);

			//var bb = t.attr("text", s.message).getBBox();
			s.text_bb = bb;
			s.width   = bb.width;
			s.height  = bb.height;

			var extra_width = 0;

			if (s.type == "Signal") {
				s.width  += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;
				s.height += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;

				a = Math.min(s.actorA.index, s.actorB.index);
				b = Math.max(s.actorA.index, s.actorB.index);

			} else if (s.type == "Note") {
				s.width  += (NOTE_MARGIN + NOTE_PADDING) * 2;
				s.height += (NOTE_MARGIN + NOTE_PADDING) * 2;

				// HACK lets include the actor's padding
				extra_width = 2 * ACTOR_MARGIN;

				if (s.placement == PLACEMENT.LEFTOF) {
					b = s.actor.index;
					a = b - 1;
				} else if (s.placement == PLACEMENT.RIGHTOF) {
					a = s.actor.index;
					b = a + 1;
				} else if (s.placement == PLACEMENT.OVER) {
					//a = actors[a];
					a = s.actor.index;
					actor_ensure_distance(a - 1, a, s.width / 2);
					actor_ensure_distance(a, a + 1, s.width / 2);
					signals_height += s.height;
					return;
				}
			} else {
				throw new Error("Unhandled signal type:" + s.type);
			}

			actor_ensure_distance(a, b, s.width + extra_width);
			signals_height += s.height;
		});

		// Re-jig the positions
		var actors_width = 0;
		_.each(actors, function(a) {
			a.x = Math.max(actors_width, a.x);
			// TODO This only works if we loop in sequence, 0, 1, 2, etc
			_.each(a.distances, function(distance, b) {
				b = actors[b];
				distance = Math.max(distance, a.width / 2, b.width / 2);
				b.x = Math.max(b.x, a.x + a.width/2 + distance - b.width/2);
			});

			actors_width = a.x + a.width + a.padding_right;
		});
		diagram_width = Math.max(actors_width, diagram_width);

		diagram_width  += 2 * DIAGRAM_MARGIN;
		diagram_height += 2 * DIAGRAM_MARGIN + 2 * actors_height + signals_height + title.height;

		//
		// Now draw
		//
		paper.setStart();
		paper.setSize(diagram_width, diagram_height);

		// Draw the actors
		function draw_actors() {
			var y = DIAGRAM_MARGIN + title.height;
			_.each(actors, function(a) {
				// Top box
				draw_actor.call(a, y, actors_height);

				// Bottom box
				draw_actor.call(a, y + actors_height + signals_height, actors_height);

				// Veritical line
				var aX = a.x + a.width/2;
				var line = paper.handLine(
					aX, y + actors_height - ACTOR_MARGIN,
					aX, y + actors_height + ACTOR_MARGIN + signals_height);
				line.attr(LINE);
			});
		}


		/**
		 * Draws a arrow head
		 * direction must be -1 for left, or 1 for right
		 */
		//function draw_arrowhead(x, y, size, direction) {
		//	var dx = (size/2) * direction;
		//	var dy = (size/2);
		//
		//	y -= dy; x -= dx;
		//	var p = paper.path("M" + x + "," + y + "v" + size + "l" + dx + ",-" + (size/2) + "Z");
		//}

		var line_types  = ['', '-'];
		var arrow_types = ['block', 'open'];

		function draw_signal(offsetY) {
			/*jshint validthis: true */
			var y = offsetY + this.height - SIGNAL_MARGIN;
			var aX = this.actorA.x + this.actorA.width/2;
			var bX = this.actorB.x + this.actorB.width/2;

			//var line = paper.line(aX, y, bX, y);
			var line = paper.handLine(aX, y, bX, y);
			line.attr(LINE);
			line.attr({
				'arrow-end': arrow_types[this.arrowtype] + '-wide-long',
				'stroke-dasharray': line_types[this.linetype]
			});

			var midx = (bX - aX) / 2 + aX;

			draw_text(paper, midx - this.width / 2, offsetY + this.height / 2, this.message);
/*
			var t = paper.text(midx, offsetY + this.height / 2);
			t.attr(FONT);
			t.attr({
				'text': this.message,
				'text-anchor': 'middle',
			});
*/

			//var ARROW_SIZE = 16;
			//var dir = this.actorA.x < this.actorB.x ? 1 : -1;
			//draw_arrowhead(bX, offsetY, ARROW_SIZE, dir);
		}

		/**
		 * Draws text with a white background
		 */
		function draw_text(paper, x, y, text) {
			var t = paper.print(x, y, text, font, 16, 'middle');
			// draw a rect behind it
			var bb = t.getBBox();
			var r = paper.rect(bb.x, bb.y, bb.width, bb.height);
			r.attr({'fill': "#fff", 'stroke-width': 0});
			t.toFront();
		}

		function draw_text_box(box, text, margin, padding) {
			var x = box.x + margin;
			var y = box.y + margin;
			var w = box.width  - 2 * margin;
			var h = box.height - 2 * margin;

			// Draw inner box
			var rect = paper.handRect(x, y, w, h);
			rect.attr(LINE);

			// Draw text
			//x = box.x + padding;
			//y = box.y + box.height / 2;

			x = box.x + margin + padding - box.text_bb.x;
			y = box.y + margin + padding - box.text_bb.y;

			var p = paper.print(x, y, text, font, 16, 'middle');

			/*
			var t = paper.text(x, y);
			t.attr(FONT);
			t.attr({
				'text': text,
				'text-anchor': 'middle',
			});
			*/
		}

		function draw_actor(offsetY, height) {
			/*jshint validthis: true */
			this.y = offsetY;
			this.height = height;
			draw_text_box(this, this.name, ACTOR_MARGIN, ACTOR_PADDING);
		}

		function draw_note(offsetY) {
			/*jshint validthis: true */
			this.y = offsetY;
			switch (this.placement) {
				case PLACEMENT.RIGHTOF:
					this.x = this.actor.x + this.actor.width / 2 + ACTOR_MARGIN;
					break;
				case PLACEMENT.LEFTOF:
					this.x = this.actor.x + this.actor.width / 2 - ACTOR_MARGIN - this.width;
					break;
				case PLACEMENT.OVER:
					this.x = this.actor.x;
					break;
				default:
					throw new Error("Unhandled note placement:" + this.placement);
			}

			draw_text_box(this, this.message, NOTE_MARGIN, NOTE_PADDING);
		}

		// Draw each signal
		function draw_signals() {
			var y = DIAGRAM_MARGIN + title.height + actors_height;
			_.each(signals, function(s) {
				if (s.type == "Signal") {
					draw_signal.call(s, y);

				} else if (s.type == "Note") {
					draw_note.call(s, y);
				}

				y += s.height;
			});
		}

		function draw_title() {
			if (title.message)
				draw_text_box(title, title.message, TITLE_MARGIN, TITLE_PADDING);
		}

		draw_title();
		draw_actors();
		draw_signals();

		paper.setFinish();

	}; // end of drawSVG

}());
