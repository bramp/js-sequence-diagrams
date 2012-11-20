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
		'font-size': 18
	};

	var LINE = {
		'stroke': '#000',
		'stroke-width': 2
	};

	Raphael.prototype.line = function(x1, y1, x2, y2) {
		var from = "M" + x1 + "," + y1;
		var to   = "L" + x2 + "," + y2;
		return this.path(from + to);
	};

	Diagram.prototype.drawSVG = function (container) {

		// Local vars
		var actors  = this.actors;
		var signals = this.signals;

		var paper = new Raphael(container, 320, 200);

		// Calculate distances between actors
		var t = paper.text(0,0).attr('text-anchor', 'middle');
		t.attr(FONT);

		// Setup some layout stuff
		var actors_height = 0;
		_.each(actors, function(a) {
			var bb = t.attr("text", a.name).getBBox();
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

			var bb = t.attr("text", s.message).getBBox();
			s.width  = bb.width;
			s.height = bb.height;

			if (s.type == "Signal") {
				s.width  += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;
				s.height += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;

				a = Math.min(s.actorA.index, s.actorB.index);
				b = Math.max(s.actorA.index, s.actorB.index);

			} else if (s.type == "Note") {
				s.width  += (NOTE_MARGIN + NOTE_PADDING) * 2;
				s.height += (NOTE_MARGIN + NOTE_PADDING) * 2;

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
			actor_ensure_distance(a, b, s.width);
			signals_height += s.height;
		});

		t.remove();

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
				var line = paper.line(
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

		function draw_signal(offsetY) {
			var y = offsetY + this.height;
			var aX = this.actorA.x + this.actorA.width/2;
			var bX = this.actorB.x + this.actorB.width/2;
			var line = paper.line(aX, y, bX, y);
			line.attr(LINE);
			line.attr({'arrow-end': 'classic-wide-long'});

			var midx = (bX - aX) / 2 + aX;

			var t = paper.text(midx, offsetY + this.height / 2);
			t.attr(FONT);
			t.attr('text-anchor', 'middle');
			t.attr("text", this.message);

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
			var rect = paper.rect(x, y, w, h);
			rect.attr(LINE);

			x = box.x + box.width / 2;
			y = box.y + box.height / 2;

			var t = paper.text(x, y);
			t.attr(FONT);
			t.attr('text-anchor', 'middle');
			t.attr("text", text);
		}

		function draw_actor(offsetY, height) {
			this.y = offsetY;
			draw_text_box(this, this.name, ACTOR_MARGIN, ACTOR_PADDING);
		}

		function draw_note(offsetY) {
			this.y = offsetY;
			switch (this.placement) {
				case PLACEMENT.RIGHTOF:
					this.x = this.actor.x + this.actor.width / 2;
					break;
				default:
					throw new Error("Unhandled note placement:" + this.placement);
			}

			draw_text_box(this, this.message, NOTE_MARGIN, NOTE_PADDING);

/*
			var rect = paper.rect(x, offsetY, this.width - 2 * NOTE_MARGIN, this.height - 2 * NOTE_MARGIN);
			rect.attr(LINE);

			var t = paper.text(	x + NOTE_PADDING, offsetY + this.height/2 - NOTE_MARGIN);
			t.attr(FONT);
			t.attr('text-anchor', 'start');
			t.attr("text", this.message);
*/
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
