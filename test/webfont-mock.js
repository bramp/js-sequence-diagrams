// Mock WebFont, so we don't need to include the real one (when it's not used during testing)
(function() {
'use strict';
this.WebFont = {
  load: function(config) {
    if (config.active) {
      // If we have a callback, call it soon
      setTimeout(config.active, 1);
    }
  },
};
}).call(this);
