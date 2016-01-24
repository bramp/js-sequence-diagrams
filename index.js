var Diagram = require('./src/sequence-diagram');
require('./src/jquery-plugin');

if (typeof window !== 'undefined') {
  window.Diagram = Diagram;
} else {
  // TODO expose only for tests or explicitly require 'sequence-diagram' in tests
  global.Diagram = Diagram;
}

module.exports = Diagram;
