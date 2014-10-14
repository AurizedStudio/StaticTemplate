module.exports = function (grunt) {

grunt.loadNpmTasks('grunt');
grunt.loadNpmTasks('grunt-webfont');

grunt.initConfig({
	paths: {
		dist: './htdocs',
		src: './source',
		bower: './bower_components'
	},
	stylestats: {
		src: ['<%= paths.dist %>/css/style.css']
	},
	webfont: {
		icons: {
			src: '<%= paths.src %>/svg/*.svg',
			dest: '<%= paths.dist %>/fonts',
			destCss: '<%= paths.src %>/scss',
			options: {
				engine: 'node',
				stylesheet: 'scss',
				relativeFontPath: '../fonts'
			}
		}
	}
});

// デフォルト Webfont作成
grunt.registerTask('default', ['webfont']);
// style.css情報。
grunt.registerTask('stats', ['stylestats']);
// Webfont作成
grunt.registerTask('font', ['webfont']);

};
