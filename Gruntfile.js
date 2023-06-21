
module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            default : {
              tsconfig: './tsconfig.json'
            }
          },
        copy: {
            main : {
                files: [
                    {expand: true, src: ['src/**/*.mustache'], dest: 'out/'}
                ]
            },
            ncc_dest : {
              files: [
                {expand: true, src: ['src/**/*.mustache'], dest: 'dist/'}
            ]
            }
        }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask("default", ["ts", "copy"]);
  };