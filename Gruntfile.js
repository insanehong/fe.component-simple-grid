//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {

    // All upfront config goes in a massive nested object.
    grunt.initConfig({
        // You can set arbitrary key-value pairs.
        distFolder: 'doc/dist',
        libFolder: 'lib',
        sampleFolder: 'samples',
        // You can also set the value of a key as parsed JSON.
        // Allows us to reference properties we declared in package.json.
        pkg: grunt.file.readJSON('package.json'),
        // Grunt tasks are associated with specific properties.
        // these names generally match their npm package name.
        concat: {
            // Specify some options, usually specific to each plugin.
            options: {
                banner: '/*!SimpleGrid v<%=pkg.version%> | NHN Entertainment*/\n' +
                '(function() {\n',
                footer: '\n})();'
            },
            // 'dist' is what is called a "target."
            // It's a way of specifying different sub-tasks or modes.
            normal: {
                // The files to concatenate:
                // Notice the wildcard, which is automatically expanded.
                src: [
                    'src/external/*.js',
                    'src/core/*.js',
                    'src/data/*.js',
                    'src/model/*.js',
                    'src/view/*.js',
                    'src/*.js'
                ],
                // The destination file:
                // Notice the angle-bracketed ERB-like templating,
                // which allows you to reference other properties.
                // This is equivalent to 'dist/main.js'.
                dest: '<%= distFolder %>/Component-SimpleGrid.js'
                // You can reference any grunt config property you want.
                // Ex: '<%= concat.options.separator %>' instead of ';'
            },
            core: {
                // The files to concatenate:
                // Notice the wildcard, which is automatically expanded.
                src: [
                    'src/core/*.js',
                    'src/data/*.js',
                    'src/model/*.js',
                    'src/view/*.js',
                    'src/*.js'
                ],
                // The destination file:
                // Notice the angle-bracketed ERB-like templating,
                // which allows you to reference other properties.
                // This is equivalent to 'dist/main.js'.
                dest: '<%= distFolder %>/Component-SimpleGrid.core.js'
                // You can reference any grunt config property you want.
                // Ex: '<%= concat.options.separator %>' instead of ';'
            }
        },
        uglify: {
            normal: {
                files: {
                    '<%= distFolder %>/Component-SimpleGrid.min.js' : '<%= distFolder %>/Component-SimpleGrid.js'
                },
                options: {
                    banner: '/*!SimpleGrid v<%=pkg.version%> | NHN Entertainment*/',
                    preserveComments: false,
                    sourceMap: true,
                    sourceMapName: "<%= distFolder %>/Component-SimpleGrid.min.map"
                }
            },
            core: {
                files: {
                    '<%= distFolder %>/Component-SimpleGrid.core.min.js' : '<%= distFolder %>/Component-SimpleGrid.core.js'
                },
                options: {
                    banner: '/*!SimpleGrid v<%=pkg.version%> | NHN Entertainment*/',
                    preserveComments: false,
                    sourceMap: true,
                    sourceMapName: "<%= distFolder %>/Component-SimpleGrid.core.min.map"
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ['<%= distFolder %>/*.js', '<%= distFolder %>/*.map'], dest: '', filter: 'isFile'}
                ]
            },
            sample: {
                files: [
                    {expand: true, flatten: true, src: ['<%= distFolder %>/Component-SimpleGrid.min.js'], dest: '<%= sampleFolder %>/js', filter: 'isFile'},
                    {expand: true, flatten: true, src: ['<%= libFolder %>/jquery/jquery.min.js'], dest: '<%= sampleFolder %>/js', filter: 'isFile'}
                ]
            }
        },
        zip: {
            main: {
                src: ['<%= distFolder %>/*'],
                dest: '<%= distFolder %>/Component-SimpleGrid.zip'
            }
        }
    }); // The end of grunt.initConfig

    // We've set up each task's configuration.
    // Now actually load the tasks.
    // This will do a lookup similar to node's require() function.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-zip');

    // Register our own custom task alias.
    grunt.registerTask('build', ['concat', 'uglify', 'copy', 'zip']);
};
