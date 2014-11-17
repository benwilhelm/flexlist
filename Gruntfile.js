grunt = require('grunt');

grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.initConfig({

	less: {
		development: {
			paths: ['public/less/**/*.less'],
			files: {
				'public/css/styles.css':'public/less/styles.less'
			}
		}
	},

	watch: {
		less: {
			files: 'public/less/*',
			tasks: ['less'],
			options: {
				livereload: true
			}
		}
	}
});

grunt.registerTask('default', ['less', 'watch']);
