/*> diagram.js */

(function () {
	"use strict";

	var DIAGRAM_MARGIN = 10;

	var ACTOR_MARGIN   = 10; // Margin around a actor
	var ACTOR_PADDING  = 10; // Padding inside a actor

	var SIGNAL_MARGIN  = 10; // Margin around a signal
	var SIGNAL_PADDING = 10; // Padding inside a signal

	var NOTE_MARGIN   = 10; // Margin around a actor
	var NOTE_PADDING  = 10; // Padding inside a actor

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
			a.width  = bb.width  + ACTOR_PADDING * 2;
			a.height = bb.height + ACTOR_PADDING * 2;

			a.x = 0;
			a.distances = [];
			actors_height = Math.max(a.height, actors_height);
		});

		function actor_ensure_distance(a, b, d) {
			if (b < a)
				throw new Error("Assertion: a must be less than or equal to b");

			a = actors[a];
			a.distances[b] = Math.max(d, a.distances[b] ? a.distances[b] : 0);
		}

		var signals_height = SIGNAL_MARGIN;
		_.each(signals, function(s) {
			var a, b; // Indexes of the left and right actors involved

			var bb = t.attr("text", s.message).getBBox();
			s.width  = bb.width;
			s.height = bb.height;

			signals_height += s.height + SIGNAL_MARGIN;

			if (s.type == "Signal") {
				s.width += SIGNAL_PADDING * 2;

				a = Math.min(s.actorA.index, s.actorB.index);
				b = Math.max(s.actorA.index, s.actorB.index);

			} else if (s.type == "Note") {
				s.width  += NOTE_PADDING * 2;
				s.height += NOTE_PADDING * 2;

				if (s.placement == PLACEMENT.LEFTOF) {
					b = s.actor.index;
					a = b - 1;
				} else if (s.placement == PLACEMENT.RIGHTOF) {
					a = s.actor.index;
					b = a + 1;
				} else if (s.placement == PLACEMENT.OVER) {
					//a = actors[a];
					a = s.actor.index;
					actor_ensure_distance(a - 1, a, s.width / 2 + NOTE_MARGIN);
					actor_ensure_distance(a, a + 1, s.width / 2 + NOTE_MARGIN);
					return;
				}
			} else {
				throw new Error("Unhandled signal type:" + s.type);
			}

			actor_ensure_distance(a, b, s.width);
		});

		t.remove();

		// Re-jig the positions
		var actors_width = DIAGRAM_MARGIN;
		_.each(actors, function(a) {
			a.x = Math.max(actors_width + ACTOR_MARGIN, a.x);
			_.each(a.distances, function(distance, b) {
				b = actors[b];
				distance = Math.max(distance, a.width / 2, b.width / 2);
				b.x = Math.max(b.x, a.x + distance);
				console.log(a, b, distance);
			});

			actors_width = a.x + a.width + ACTOR_MARGIN;
		});

		//
		// Now draw
		//
		paper.setSize(
			2 * DIAGRAM_MARGIN + actors_width,
			2 * DIAGRAM_MARGIN + 2 * actors_height + ACTOR_MARGIN + signals_height);
		paper.setStart();

		// Draw the actors
		var y = DIAGRAM_MARGIN;
		_.each(actors, function(a) {
			// Top box
			draw_actor(a, 0, y, actors_height);

			// Bottom box
			draw_actor(a, 0, y + actors_height + signals_height, actors_height);

			// Veritical line
			var aX = a.x + a.width/2;
			var line = paper.line(aX, y + actors_height, aX, y + actors_height + signals_height);
			line.attr(LINE);
		});

		function draw_actor(a, offsetX, offsetY, height) {
			var rect = paper.rect(a.x, offsetY, a.width, height);
			rect.attr(LINE);

			var t = paper.text(	a.x + ACTOR_PADDING, offsetY + height/2);
			t.attr(FONT);
			t.attr('text-anchor', 'start');
			t.attr("text", a.name);
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

		function draw_note(offsetY) {
			var x = 0;
			switch (this.placement) {
				case PLACEMENT.RIGHTOF:
					x = this.actor.x + this.actor.width / 2 + NOTE_MARGIN;
					break;
				default:
					throw new Error("Unhandled note placement:" + this.placement);
			}

			var rect = paper.rect(x, offsetY, this.width, this.height);
			rect.attr(LINE);

			var midx = (this.width) / 2 + x;
			var t = paper.text(	x + NOTE_PADDING, offsetY + this.height/2);
			t.attr(FONT);
			t.attr('text-anchor', 'start');
			t.attr("text", this.message);
		}

		// Draw each signal
		y = DIAGRAM_MARGIN + actors_height + ACTOR_MARGIN;
		_.each(signals, function(s) {
			if (s.type == "Signal") {
				draw_signal.call(s, y);

			} else if (s.type == "Note") {
				draw_note.call(s, y);
			}

			y += s.height + SIGNAL_MARGIN;
		});

		paper.setFinish();

	}; // end of drawSVG

}());
