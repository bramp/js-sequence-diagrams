/** js sequence diagrams
 *  https://bramp.github.io/js-sequence-diagrams/
 *  (c) 2012-2017 Andrew Brampton (bramp.net)
 *  Simplified BSD license.
 */
/*global Diagram, _ */

// Following the CSS convention
// Margin is the gap outside the box
// Padding is the gap inside the box
// Each object has x/y/width/height properties
// The x/y should be top left corner
// width/height is with both margin and padding

// TODO
// Image width is wrong, when there is a note in the right hand col
// Title box could look better
// Note box could look better

var DIAGRAM_MARGIN = 10;

var ACTOR_MARGIN   = 10; // Margin around a actor
var ACTOR_PADDING  = 10; // Padding inside a actor

var SIGNAL_MARGIN  = 5; // Margin around a signal
var SIGNAL_PADDING = 5; // Padding inside a signal

var NOTE_MARGIN   = 10; // Margin around a note
var NOTE_PADDING  = 5; // Padding inside a note
var NOTE_OVERLAP  = 15; // Overlap when using a "note over A,B"

var TITLE_MARGIN   = 0;
var TITLE_PADDING  = 5;

var SELF_SIGNAL_WIDTH = 20; // How far out a self signal goes

var PLACEMENT = Diagram.PLACEMENT;
var LINETYPE  = Diagram.LINETYPE;
var ARROWTYPE = Diagram.ARROWTYPE;

var ALIGN_LEFT   = 0;
var ALIGN_CENTER = 1;
var ALIGN_HORIZONTAL_CENTER = 2;
var ALIGN_VERTICAL_CENTER = 3;

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function() {
  return 'AssertException: ' + this.message;
};

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

Diagram.themes = {};
function registerTheme(name, theme) {
  Diagram.themes[name] = theme;
}

/******************
 * Drawing extras
 ******************/

function getCenterX(box) {
  return box.x + box.width / 2;
}

function getCenterY(box) {
  return box.y + box.height / 2;
}

/******************
 * SVG Path extras
 ******************/

function clamp(x, min, max) {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}

function wobble(x1, y1, x2, y2) {
  assert(_.every([x1,x2,y1,y2], _.isFinite), 'x1,x2,y1,y2 must be numeric');

  // Wobble no more than 1/25 of the line length
  var factor = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 25;

  // Distance along line where the control points are
  // Clamp between 20% and 80% so any arrow heads aren't angled too much
  var r1 = clamp(Math.random(), 0.2, 0.8);
  var r2 = clamp(Math.random(), 0.2, 0.8);

  var xfactor = Math.random() > 0.5 ? factor : -factor;
  var yfactor = Math.random() > 0.5 ? factor : -factor;

  var p1 = {
    x: (x2 - x1) * r1 + x1 + xfactor,
    y: (y2 - y1) * r1 + y1 + yfactor
  };

  var p2 = {
    x: (x2 - x1) * r2 + x1 - xfactor,
    y: (y2 - y1) * r2 + y1 - yfactor
  };

  return 'C' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1) + // start control point
         ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1) + // end control point
         ' ' + x2.toFixed(1) + ',' + y2.toFixed(1);      // end point
}

/**
 * Draws a wobbly (hand drawn) rect
 */
function handRect(x, y, w, h) {
  assert(_.every([x, y, w, h], _.isFinite), 'x, y, w, h must be numeric');
  return 'M' + x + ',' + y +
   wobble(x, y, x + w, y) +
   wobble(x + w, y, x + w, y + h) +
   wobble(x + w, y + h, x, y + h) +
   wobble(x, y + h, x, y);
}

/**
 * Draws a wobbly (hand drawn) line
 */
function handLine(x1, y1, x2, y2) {
  assert(_.every([x1,x2,y1,y2], _.isFinite), 'x1,x2,y1,y2 must be numeric');
  return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + wobble(x1, y1, x2, y2);
}

/******************
 * BaseTheme
 ******************/

var BaseTheme = function(diagram, options) {
  this.init(diagram, options);
};

_.extend(BaseTheme.prototype, {

  // Init called while creating the Theme
  init: function(diagram, options) {
    this.diagram = diagram;

    this.actorsHeight_  = 0;
    this.signalsHeight_ = 0;
    this.title_ = undefined; // hack - This should be somewhere better
  },

  setupPaper: function(container) {},

  draw: function(container) {
    this.setupPaper(container);

    this.layout();

    var titleHeight = this.title_ ? this.title_.height : 0;
    var y = DIAGRAM_MARGIN + titleHeight;

    this.drawTitle();
    this.drawActors(y);
    this.drawSignals(y + this.actorsHeight_);
  },

  layout: function() {
    // Local copies
    var diagram = this.diagram;
    var font    = this.font_;
    var actors  = diagram.actors;
    var signals = diagram.signals;

    diagram.width  = 0; // min width
    diagram.height = 0; // min height

    // Setup some layout stuff
    if (diagram.title) {
      var title = this.title_ = {};
      var bb = this.textBBox(diagram.title, font);
      title.textBB = bb;
      title.message = diagram.title;

      title.width  = bb.width  + (TITLE_PADDING + TITLE_MARGIN) * 2;
      title.height = bb.height + (TITLE_PADDING + TITLE_MARGIN) * 2;
      title.x = DIAGRAM_MARGIN;
      title.y = DIAGRAM_MARGIN;

      diagram.width  += title.width;
      diagram.height += title.height;
    }

    _.each(actors, _.bind(function(a) {
      var bb = this.textBBox(a.name, font);
      a.textBB = bb;

      a.x = 0; a.y = 0;
      a.width  = bb.width  + (ACTOR_PADDING + ACTOR_MARGIN) * 2;
      a.height = bb.height + (ACTOR_PADDING + ACTOR_MARGIN) * 2;

      a.distances = [];
      a.paddingRight = 0;
      this.actorsHeight_ = Math.max(a.height, this.actorsHeight_);
    }, this));

    function actorEnsureDistance(a, b, d) {
      assert(a < b, 'a must be less than or equal to b');

      if (a < 0) {
        // Ensure b has left margin
        b = actors[b];
        b.x = Math.max(d - b.width / 2, b.x);
      } else if (b >= actors.length) {
        // Ensure a has right margin
        a = actors[a];
        a.paddingRight = Math.max(d, a.paddingRight);
      } else {
        a = actors[a];
        a.distances[b] = Math.max(d, a.distances[b] ? a.distances[b] : 0);
      }
    }

    _.each(signals, _.bind(function(s) {
      // Indexes of the left and right actors involved
      var a;
      var b;

      var bb = this.textBBox(s.message, font);

      s.textBB = bb;
      s.width   = bb.width;
      s.height  = bb.height;

      var extraWidth = 0;

      if (s.type == 'Signal') {

        s.width  += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;
        s.height += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;

        if (s.isSelf()) {
          // TODO Self signals need a min height
          a = s.actorA.index;
          b = a + 1;
          s.width += SELF_SIGNAL_WIDTH;
        } else {
          a = Math.min(s.actorA.index, s.actorB.index);
          b = Math.max(s.actorA.index, s.actorB.index);
        }

      } else if (s.type == 'Note') {
        s.width  += (NOTE_MARGIN + NOTE_PADDING) * 2;
        s.height += (NOTE_MARGIN + NOTE_PADDING) * 2;

        // HACK lets include the actor's padding
        extraWidth = 2 * ACTOR_MARGIN;

        if (s.placement == PLACEMENT.LEFTOF) {
          b = s.actor.index;
          a = b - 1;
        } else if (s.placement == PLACEMENT.RIGHTOF) {
          a = s.actor.index;
          b = a + 1;
        } else if (s.placement == PLACEMENT.OVER && s.hasManyActors()) {
          // Over multiple actors
          a = Math.min(s.actor[0].index, s.actor[1].index);
          b = Math.max(s.actor[0].index, s.actor[1].index);

          // We don't need our padding, and we want to overlap
          extraWidth = -(NOTE_PADDING * 2 + NOTE_OVERLAP * 2);

        } else if (s.placement == PLACEMENT.OVER) {
          // Over single actor
          a = s.actor.index;
          actorEnsureDistance(a - 1, a, s.width / 2);
          actorEnsureDistance(a, a + 1, s.width / 2);
          this.signalsHeight_ += s.height;

          return; // Bail out early
        }
      } else {
        throw new Error('Unhandled signal type:' + s.type);
      }

      actorEnsureDistance(a, b, s.width + extraWidth);
      this.signalsHeight_ += s.height;
    }, this));

    // Re-jig the positions
    var actorsX = 0;
    _.each(actors, function(a) {
      a.x = Math.max(actorsX, a.x);

      // TODO This only works if we loop in sequence, 0, 1, 2, etc
      _.each(a.distances, function(distance, b) {
        // lodash (and possibly others) do not like sparse arrays
        // so sometimes they return undefined
        if (typeof distance == 'undefined') {
          return;
        }

        b = actors[b];
        distance = Math.max(distance, a.width / 2, b.width / 2);
        b.x = Math.max(b.x, a.x + a.width / 2 + distance - b.width / 2);
      });

      actorsX = a.x + a.width + a.paddingRight;
    });

    diagram.width = Math.max(actorsX, diagram.width);

    // TODO Refactor a little
    diagram.width  += 2 * DIAGRAM_MARGIN;
    diagram.height += 2 * DIAGRAM_MARGIN + 2 * this.actorsHeight_ + this.signalsHeight_;

    return this;
  },

  // TODO Instead of one textBBox function, create a function for each element type, e.g
  //      layout_title, layout_actor, etc that returns it's bounding box
  textBBox: function(text, font) {},

  drawTitle: function() {
    var title = this.title_;
    if (title) {
      this.drawTextBox(title, title.message, TITLE_MARGIN, TITLE_PADDING, this.font_, ALIGN_LEFT);
    }
  },

  drawActors: function(offsetY) {
    var y = offsetY;
    _.each(this.diagram.actors, _.bind(function(a) {
      // Top box
      this.drawActor(a, y, this.actorsHeight_);

      // Bottom box
      this.drawActor(a, y + this.actorsHeight_ + this.signalsHeight_, this.actorsHeight_);

      // Veritical line
      var aX = getCenterX(a);
      this.drawLine(
       aX, y + this.actorsHeight_ - ACTOR_MARGIN,
       aX, y + this.actorsHeight_ + ACTOR_MARGIN + this.signalsHeight_);
    }, this));
  },

  drawActor: function(actor, offsetY, height) {
    actor.y      = offsetY;
    actor.height = height;
    this.drawTextBox(actor, actor.name, ACTOR_MARGIN, ACTOR_PADDING, this.font_, ALIGN_CENTER);
  },

  drawSignals: function(offsetY) {
    var y = offsetY;
    _.each(this.diagram.signals, _.bind(function(s) {
      // TODO Add debug mode, that draws padding/margin box
      if (s.type == 'Signal') {
        if (s.isSelf()) {
          this.drawSelfSignal(s, y);
        } else {
          this.drawSignal(s, y);
        }

      } else if (s.type == 'Note') {
        this.drawNote(s, y);
      }

      y += s.height;
    }, this));
  },

  drawSelfSignal: function(signal, offsetY) {
    assert(signal.isSelf(), 'signal must be a self signal');

    var textBB = signal.textBB;
    var aX = getCenterX(signal.actorA);

    var y1 = offsetY + SIGNAL_MARGIN + SIGNAL_PADDING;
    var y2 = y1 + signal.height - 2 * SIGNAL_MARGIN - SIGNAL_PADDING;

    // Draw three lines, the last one with a arrow
    this.drawLine(aX, y1, aX + SELF_SIGNAL_WIDTH, y1, signal.linetype);
    this.drawLine(aX + SELF_SIGNAL_WIDTH, y1, aX + SELF_SIGNAL_WIDTH, y2, signal.linetype);
    this.drawLine(aX + SELF_SIGNAL_WIDTH, y2, aX, y2, signal.linetype, signal.arrowtype);

    // Draw text
    var x = aX + SELF_SIGNAL_WIDTH + SIGNAL_PADDING;
    var arrowHeight = (y2 - y1);
    var emptyVerticalSpace = arrowHeight - textBB.height;
    var topPadding = emptyVerticalSpace / 2;
    var y = y1 + topPadding;

    this.drawText(x, y, signal.message, this.font_, ALIGN_LEFT);
  },

  drawSignal: function(signal, offsetY) {
    var aX = getCenterX(signal.actorA);
    var bX = getCenterX(signal.actorB);

    // Mid point between actors
    var x = (bX - aX) / 2 + aX;
    var y = offsetY + SIGNAL_MARGIN + SIGNAL_PADDING;

    // Draw the text in the middle of the signal
    this.drawText(x, y, signal.message, this.font_, ALIGN_HORIZONTAL_CENTER);

    // Draw the line along the bottom of the signal
    // Padding above, between message and line
    // Margin below the line, between line and next signal
    y = offsetY + signal.height - SIGNAL_PADDING;
    this.drawLine(aX, y, bX, y, signal.linetype, signal.arrowtype);
  },

  drawNote: function(note, offsetY) {
    note.y = offsetY;
    var actorA = note.hasManyActors() ? note.actor[0] : note.actor;
    var aX = getCenterX(actorA);
    switch (note.placement) {
    case PLACEMENT.RIGHTOF:
      note.x = aX + ACTOR_MARGIN;
    break;
    case PLACEMENT.LEFTOF:
      note.x = aX - ACTOR_MARGIN - note.width;
    break;
    case PLACEMENT.OVER:
      if (note.hasManyActors()) {
        var bX = getCenterX(note.actor[1]);
        var overlap = NOTE_OVERLAP + NOTE_PADDING;
        note.x = Math.min(aX, bX) - overlap;
        note.width = (Math.max(aX, bX) + overlap) - note.x;
      } else {
        note.x = aX - note.width / 2;
      }
    break;
    default:
      throw new Error('Unhandled note placement: ' + note.placement);
  }
    return this.drawTextBox(note, note.message, NOTE_MARGIN, NOTE_PADDING, this.font_, ALIGN_LEFT);
  },

  /**
   * Draw text surrounded by a box
   */
  drawTextBox: function(box, text, margin, padding, font, align) {
    var x = box.x + margin;
    var y = box.y + margin;
    var w = box.width  - 2 * margin;
    var h = box.height - 2 * margin;

    // Draw inner box
    this.drawRect(x, y, w, h);

    // Draw text (in the center)
    if (align == ALIGN_CENTER) {
      x = getCenterX(box);
      y = getCenterY(box);
    } else {
      x += padding;
      y += padding;
    }

    return this.drawText(x, y, text, font, align);
  }
});
