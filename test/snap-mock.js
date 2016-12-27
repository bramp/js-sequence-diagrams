// Mock Snap, so we don't need to include the real one (when it's not used during testing)
(function() {
'use strict';

    var Snap = function() {
      // Returns a paper
      return {
          addClass: function() {
            // do nothing
          },
          path: function() {
            // Returns a path
              return {
                marker : function() {
                  // Returns something
                  return {
                    attr: function() {
                      // do nothing
                    }
                  }
                }
              }
          },
          text: function() {}
      };
    };

    Snap.prototype.plugin = function () {
      // Do nothing
    };

    this.Snap = Snap;

}).call(this);
