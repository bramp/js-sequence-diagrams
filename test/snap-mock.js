// Mock Snap, so we don't need to include the real one (when it's not used during testing)
(function () {
	"use strict";
	this.Snap = {
		// TODO
		plugin: function(plug) {
			plug(this.plugin, this.plugin, this.plugin, this.plugin, this.plugin);
		}
	}
}).call(this); 
