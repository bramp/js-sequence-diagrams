/*> diagram.js */

(function () {
	"use strict";

	// Following the CSS convention
	// Margin is the gap outside the box
	// Padding is the gap inside the box

	var DIAGRAM_MARGIN = 10;

	var ACTOR_MARGIN   = 10; // Margin around a actor
	var ACTOR_PADDING  = 10; // Padding inside a actor

	var SIGNAL_MARGIN  = 5; // Margin around a signal
	var SIGNAL_PADDING = 5; // Padding inside a signal

	var NOTE_MARGIN   = 10; // Margin around a note
	var NOTE_PADDING  = 5; // Padding inside a note

	var PLACEMENT = Diagram.PLACEMENT;
	var LINETYPE  = Diagram.LINETYPE;
	var ARROWTYPE = Diagram.ARROWTYPE;

	var FONT = {
		'font-size': 18,
		'font-family': 'daniel',
	};

	var LINE = {
		'stroke': '#000',
		'stroke-width': 2
	};

	Raphael.fn.line = function(x1, y1, x2, y2) {
		return this.path("M{0},{1} L{2},{3}", x1, y1, x2, y2);
	};

	Raphael.fn.wobble = function(x1, y1, x2, y2) {
		var wobble = Math.sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 25;

		// Distance along line
		var r1 = Math.random();
		var r2 = Math.random();

		var xfactor = Math.random() > 0.5 ? wobble : -wobble;
		var yfactor = Math.random() > 0.5 ? wobble : -wobble;

		var p1 = {
			x: (x2 - x1) * r1 + x1 + xfactor,
			y: (y2 - y1) * r1 + y1 + yfactor,
		};

		var p2 = {
			x: (x2 - x1) * r2 + x1 - xfactor,
			y: (y2 - y1) * r2 + y1 - yfactor,
		};

		return "C" + p1.x + "," + p1.y
			 + " " + p2.x + "," + p2.y
			 + " " + x2 + "," + y2;

	};

	Raphael.fn.handRect = function (x, y, w, h) {
		return this.path("M" + x + "," + y
			+ this.wobble(x, y, x + w, y)
			+ this.wobble(x + w, y, x + w, y + h)
			+ this.wobble(x + w, y + h, x, y + h)
			+ this.wobble(x, y + h, x, y)
			);
	}

	Raphael.fn.handLine = function (x1, y1, x2, y2) {
		return this.path("M" + x1 + "," + y1 + this.wobble(x1, y1, x2, y2));
	}

	Diagram.prototype.drawSVG = function (container) {

		// Local vars
		var actors  = this.actors;
		var signals = this.signals;

		var paper = new Raphael(container, 320, 200);
		var font = paper.getFont('daniel');

		// Calculate distances between actors
		//var t = paper.text(0,0).attr('text-anchor', 'middle');
		//t.attr(FONT);

		// Setup some layout stuff
		var actors_height = 0;
		_.each(actors, function(a) {
			
			var p = paper.print(0, 0, a.name, font, 16, 'middle');
			var bb = p.getBBox();
			p.remove();

			//var bb = t.attr("text", a.name).getBBox();
			a.width  = bb.width  + (ACTOR_PADDING + ACTOR_MARGIN) * 2;
			a.height = bb.height + (ACTOR_PADDING + ACTOR_MARGIN) * 2;

			a.x = 0;
			a.distances = [];
			actors_height = Math.max(a.height, actors_height);
		});

		function actor_ensure_distance(a, b, d) {
			if (b < a)
				throw new Error("Assertion: a must be less than or equal to b");

			if (a < 0) {
				// Ensure b has left margin
			} else if (b >= actors.length) {
				// Ensure b has right margin
			}

			a = actors[a];
			a.distances[b] = Math.max(d, a.distances[b] ? a.distances[b] : 0);
		}

		var signals_height = 0;
		_.each(signals, function(s) {
			var a, b; // Indexes of the left and right actors involved

			var p = paper.print(0, 0, s.message, font, 16, 'middle');
			var bb = p.getBBox();
			p.remove();
			
			//var bb = t.attr("text", s.message).getBBox();
			s.width  = bb.width;
			s.height = bb.height;

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
					return;
				}
			} else {
				throw new Error("Unhandled signal type:" + s.type);
			}

			//this.x = this.actor.x + this.actor.width / 2;
			actor_ensure_distance(a, b, s.width + extra_width);
			signals_height += s.height;
		});

		//t.remove();

		// Re-jig the positions
		var actors_width = DIAGRAM_MARGIN;
		_.each(actors, function(a) {
			a.x = Math.max(actors_width, a.x);
			// TODO This only works if we loop in sequence, 0, 1, 2, etc
			_.each(a.distances, function(distance, b) {
				b = actors[b];
				distance = Math.max(distance, a.width / 2, b.width / 2);
				b.x = Math.max(b.x, a.x + a.width/2 + distance - b.width/2);
			});

			actors_width = a.x + a.width;
		});

		//
		// Now draw
		//
		paper.setSize(
			2 * DIAGRAM_MARGIN + actors_width,
			2 * DIAGRAM_MARGIN + 2 * actors_height + signals_height
		);
		paper.setStart();

		// Draw the actors
		function draw_actors() {
			var y = DIAGRAM_MARGIN;
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

		var line_types = ['', '-'];
		var arrow_types = ['block', 'open'];

		function draw_signal(offsetY) {
			var y = offsetY + this.height - SIGNAL_MARGIN;
			var aX = this.actorA.x + this.actorA.width/2;
			var bX = this.actorB.x + this.actorB.width/2;

			//var line = paper.line(aX, y, bX, y);
			var line = paper.handLine(aX, y, bX, y, 5);
			line.attr(LINE);
			line.attr({
				'arrow-end': arrow_types[this.arrowtype] + '-wide-long',
				'stroke-dasharray': line_types[this.linetype]
			});

			var midx = (bX - aX) / 2 + aX;

			paper.print(midx - this.width / 2, offsetY + this.height / 2, this.message, font, 16, 'middle');

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

		function draw_text_box(box, text, margin, padding) {
			var x = box.x + margin;
			var y = box.y + margin;
			var w = box.width - 2 * margin;
			var h = box.height - 2 * margin;

			// Draw inner box
			var rect = paper.handRect(x, y, w, h);
			rect.attr(LINE);

			x = box.x + box.width / 2;
			y = box.y + box.height / 2;

			var t=paper.print(box.x + padding, y, text, font, 16, 'middle');

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
			this.y = offsetY;
			draw_text_box(this, this.name, ACTOR_MARGIN, ACTOR_PADDING);
		}

		function draw_note(offsetY) {
			this.y = offsetY;
			switch (this.placement) {
				case PLACEMENT.RIGHTOF:
					this.x = this.actor.x + this.actor.width / 2 + ACTOR_MARGIN;
					break;
				default:
					throw new Error("Unhandled note placement:" + this.placement);
			}

			draw_text_box(this, this.message, NOTE_MARGIN, NOTE_PADDING);
		}

		// Draw each signal
		function draw_signals() {
			var y = DIAGRAM_MARGIN + actors_height;
			_.each(signals, function(s) {
				if (s.type == "Signal") {
					draw_signal.call(s, y);

				} else if (s.type == "Note") {
					draw_note.call(s, y);
				}

				y += s.height;
			});
		}

		draw_actors();
		draw_signals();

		paper.setFinish();

	}; // end of drawSVG

}());
