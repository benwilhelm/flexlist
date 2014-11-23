grunt = require('grunt');

grunt.loadNpmTasks('grunt-http-server');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.initConfig({

	'http-server': {
		'dev': {
			root: 'public',
			port: 8000,
			host: '127.0.0.1',
			runInBackground: true
		}
	},

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
		},

		html: {
			files: 'public/views/**/*.html',
			options: {
				livereload: true
			}
		}
	}
});

grunt.registerTask('default', ['less', 'http-server:dev', 'watch']);
