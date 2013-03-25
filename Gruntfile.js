module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['tmp'],

    jshint: {
      all: ['Gruntfile.js', 'src/diagram.js', 'src/sequence-diagram.js']
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'tmp/diagram-grammar.js',
          'src/jquery-plugin.js',
          'fonts/daniel/daniel_700.font.js',
          'src/sequence-diagram.js'
        ],
        dest: 'sequence-diagram.js'
      }
    },

    uglify: {
      minified: {
        files: {
          'sequence-diagram-min.js': [ 'sequence-diagram.js' ]
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
      target: 'tmp/grammar.js'
    },

    rig: {
      compile: {
        files: {
          'tmp/diagram-grammar.js': ['src/diagram.js']
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-rigger');

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['clean', 'grammar', 'rig', 'concat', 'uglify', 'copy']);

  grunt.registerTask('grammar', "Execute jison", function() {
    var opts = grunt.config.data.grammar;

    var Parser = require('jison').Parser;

    var grammar = grunt.file.read(opts.src);
    var parser = new Parser(grammar);
    var parserSource = parser.generate({
      moduleName: 'grammar'
    });

    grunt.file.write(opts.target, parserSource);
  });

};