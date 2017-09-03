define("ace/mode/sequencebramp_highlight_rules", ["require", "exports", "module", "ace/lib/oop"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop")
      , i = e("./text_highlight_rules").TextHighlightRules
      , s = function() {
        function t(e) {
            var t = /\w/.test(e) ? "\\b" : "(?:\\B|^)";
            return t + e + "[^" + e + "].*?" + e + "(?![\\w*])"
        }
        this.$rules = {
            start: [{
                token: "comment",
                regex: /^\s*#.*/
            }, {
                token: ["text", "string"],
                regex: /^(\s*title:)(.*)/,
		caseInsensitive: true,
            }, {
		// this doesn't handle commas well
                token: ["text", "keyword", "text", "string"],
                regex: /^(\s*note\s+(?:left\s+of|right\s+of|over)\s+)(.*)(:)(.*)/,
		caseInsensitive: true,
            }, {
                token: ["text", "string", "text", "keyword"],
                regex: /^(\s*participant\s+)(.*)(\bas\b)(.*)/,
		caseInsensitive: true,
            }, {
                token: ["text", "keyword"],
                regex: /^(\s*participant\s+)(.*)/,
		caseInsensitive: true,
            }, {
                token: ["keyword", "operator", "keyword", "text", "string"],
                regex: /^(\s*.*)(-?->>?)(.*)(\s*:\s*)(.*)?$/,
	    },
        ]};
    };
    r.inherits(s, i),
    t.SequencebrampHighlightRules = s
}),
define("ace/mode/sequencebramp", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/sequencebramp_highlight_rules", "ace/mode/folding/sequencebramp"],
  function(e, t, n) {
    "use strict";
    var r = e("../lib/oop")
      , i = e("./text").Mode
      , s = e("./sequencebramp_highlight_rules").SequencebrampHighlightRules
      , u = function() {
        this.HighlightRules = s
    };
    r.inherits(u, i),
    function() {
        this.type = "text",
        this.$id = "ace/mode/sequencebramp"
    }
    .call(u.prototype),
    t.Mode = u
})
