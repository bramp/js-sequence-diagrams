// Mock window/document, as we don't have the real one in qunit tests
(function() {
    'use strict';
    this.window = {

    };

    this.document = {
        createElement: function(elem) {
            return {
                tagName: elem,

                appendChild: function() {
                    // nothing
                }
            };
        },

        createElementNS: function(ns, elem) {
            return this.createElement(elem);
        },

        createTextNode: function(text) {
            return {text: text};
        },
    };
}).call(this);
