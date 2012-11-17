(function () {
	"use strict";

	Array.prototype.repeat= function(what, L){
		while(L) this[--L]= what;
		return this;
	};

	Raphael.prototype.line = function(x1, y1, x2, y2) {
		var from = "M" + x1 + "," + y1;
		var to   = "L" + x2 + "," + y2;
		return this.path(from + to);
	};

	$(document).ready(function(){
		$('#parse').click(function() {
			//actors  = [];
			//signals = [];

			var diagram = grammar.parse($('#language').val());
			console.log(diagram);

			var actors  = diagram.actors;
			var signals = diagram.signals;

			var paper = new Raphael('diagram', 320, 200);

			var DIAGRAM_MARGIN = 10;
			var ACTOR_MARGIN   = 10; // Margin around a actor
			var ACTOR_PADDING  = 10; // Padding inside a actor
			var SIGNAL_PADDING = 10; // Margin around a signal

			var FONT = {
				'font-size': 18,
				//'font-family': 'FranklinGothicFSCondensed-1, FranklinGothicFSCondensed-2'
			};


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

			var signals_height = 0;
			_.each(signals, function(s) {
				var a, b; // Indexes of the left and right actors involved

				var bb = t.attr("text", s.message).getBBox();
				var w  = bb.width;
				s.height = bb.height;

				signals_height += s.height;

				if (s.type == "Signal") {
					a = Math.min(s.actorA.index, s.actorB.index);
					b = Math.max(s.actorA.index, s.actorB.index);
					w += SIGNAL_PADDING * 2;

				} else if (s.type == "Note") {
					if (s.placement == PLACEMENT.LEFTOF) {
						b = s.actor.index;
						a = b - 1;
					} else if (s.placement == PLACEMENT.RIGHTOF) {
						a = s.actor.index;
						b = a + 1;
					} else if (s.placement == PLACEMENT.OVER) {
						a = actors[a];
						a.width = w;
						return;
					}
				} else {
					/* Opps something went wrong! */
				}


				a = actors[a];
				//b = actors[b];
				a.distances[b] = Math.max(w, a.distances[b] ? a.distances[b] : 0);
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
			paper.setSize(actors_width, 2 * DIAGRAM_MARGIN + 2 * actors_height + signals_height);
			paper.setStart();

			function draw_actor(a, offsetX, offsetY, height) {
				var rect = paper.rect(a.x, offsetY, a.width, height);
				rect.attr("stroke", "#000");

				var t = paper.text(	a.x + ACTOR_PADDING, offsetY + height/2);
				t.attr(FONT);
				t.attr('text-anchor', 'start');
				t.attr("text", a.name);
			}

			var y = DIAGRAM_MARGIN;
			_.each(actors, function(a) {
				// Top box
				draw_actor(a, 0, y, actors_height);

				// Bottom box
				draw_actor(a, 0, y + actors_height + signals_height, actors_height);

				// Veritical line
				var aX = a.x + a.width/2;
				paper.line(aX, y + actors_height, aX, y + actors_height + signals_height);

			});

			// Draw each signal
			y = actors_height;
			_.each(signals, function(s) {

				y += s.height;

				if (s.type == "Signal") {

					var aX = s.actorA.x + s.actorA.width/2;
					var bX = s.actorB.x + s.actorB.width/2;
					paper.line(aX, y, bX, y);

					var midx = (bX - aX) / 2 + aX;

					var t = paper.text(midx, y);
					t.attr(FONT);
					t.attr('text-anchor', 'middle');
					t.attr("text", s.message);

				} else if (s.type == "Note") {
				}

			});

			paper.setFinish();
		});
	});

}());
