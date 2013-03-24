module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['sequence-diagram-min.js*', 'grammar.js', 'diagram-grammar.js'],
    jshint: {
      all: ['Gruntfile.js', 'src/diagram.js', 'src/sequence-diagram.js']
    },
    uglify: {
      'js-sequence-diagrams': {
        files: {
          'sequence-diagram-min.js': [
            'diagram-grammar.js',
            'src/jquery-plugin.js',
            'fonts/daniel/daniel_700.font.js',
            'src/sequence-diagram.js'
          ]
        },
        options: {
          mangle: false,
          compress: true,
          preserveComments: 'some',
          sourceMap: 'sequence-diagram-min.js.map'
        }
      }
    },
    grammar: {
      src: 'src/grammar.jison',
      target: 'grammar.js'
    },
    rig: {
      compile: {
        files: {
          'diagram-grammar.js': ['src/diagram.js']
        }
      }
    },
    copy: {
      main: {
        files: [{
          src: 'sequence-diagram-min.js',
          dest: '_site/'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-rigger');

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['clean', 'grammar', 'rig', 'uglify', 'copy']);

  grunt.registerTask('grammar', "Execute jison", function() {
    var opts = grunt.config.data.grammar;

    var Parser = require('jison').Parser;

    var grammar = grunt.file.read(opts.src);
    var parser = new Parser(grammar);
    var parserSource = parser.generate();

    grunt.file.write(opts.target, parserSource);
  });

};