module.exports = function (grunt) {

var pkg = grunt.file.readJSON('package.json');
var taskName;
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
		grunt.loadNpmTasks(taskName);
		}
	}

grunt.initConfig({
	paths: {
		dist: './htdocs',
		src: './source',
		bower: './bower_components'
	},
	copy : {
    sass : {
      files : [{
				expand:true,
				cwd:'<%= paths.bower %>/bootstrap-sass/assets/stylesheets/',
				src:'**/*.scss',
				dest:'<%= paths.src %>/scss/'
				// filter:'isFile'
				}]
    },
    font : {
      files : [{
				expand:true,
				cwd:'<%= paths.bower %>/bootstrap-sass/assets/fonts/bootstrap/',
				src:'*.*',
				dest:'<%= paths.dist %>/fonts/'
				}]
    }
  },
	concat: {
		dist: {
			src: ['<%= paths.src %>/scss/bootstrap.scss', '<%= paths.src %>/scss/add-style.scss'],
			dest: '<%= paths.src %>/scss/style.scss'
		}
	},
	rename: {
  	main: {
    	files: [
        {src: ['<%= paths.src %>/scss/bootstrap.scss'], dest: '<%= paths.src %>/scss/style.scss'},
      ]
  	}
	},
	connect: {
		uses_defaults: {}
	},
	sass: {
    dist: {
    	options: {
      	sourcemap: 'true',
	    	style: 'expanded'
    	},
      files: {
      	'<%= paths.dist %>/css/style.css':'<%= paths.src %>/scss/style.scss'
      }
    }
	},
	autoprefixer: {
		options: {
			browsers: ['last 2 version', 'ie 8', 'ie 9']
		},
		no_dest:{
			src: '<%= paths.dist %>/css/style.css',
		}
	},
  watch: {
    css: {
			files: ['<%= paths.src %>/scss/**/*.scss'],
      tasks: ['sass', 'autoprefixer']
    }
  },
	esteWatch: {
		options: {
			dirs: ['scss/','scss/mixins/','scss/owl/'],
			livereload: {
				enabled: false
			}
		},
		'scss': function(filepath) {
//			return ['less', 'autoprefixer']
			return ['sass:dist']
		}
	},
	browserSync: {
		dev: {
			bsFiles: {
				src: ['<%= paths.dist %>/js/*.js','<%= paths.dist %>/css/*.css','<%= paths.dist %>/*.html']
			},
			options: {
				watchTask: true,
				proxy: "192.168.0.30:8000"
			}
		}
		// default_options: {
		// 	files: {
		// 		src: ['<%= paths.dist %>/js/*.js','<%= paths.dist %>/css/*.css','<%= paths.dist %>/*.html']
		// 	},
		// 	options: {
		// 		watchTask: true,
		// 		proxy: "192.168.0.30:8000"
		// 	}
		// }
	},
	stylestats: {
		src: ['<%= paths.dist %>/css/style.css']
	},
  sprite: {
    all:{
      src: '<%= paths.src %>/sprite-sns-img/*.png',
      destCSS: '<%= paths.src %>/scss/_sprite-sns-img.scss',
      destImg: '<%= paths.dist %>/img/bg-sns.png',
      'algorithm': 'binary-tree',
      'imgPath': '../img/bg-sns.png'
    }
  },
  webfont: {
    icons: {
      src: '<%= paths.src %>/svg/*.svg',
      dest: '<%= paths.dist %>/fonts',
      destCss: 'scss',
      options: {
        engine: 'node',
        stylesheet: 'scss',
        relativeFontPath: '../fonts'
      }
    }
  },
	image: {
		dynamic: {
			files: [{
				expand: true,
				cwd: '<%= paths.dist %>',
				src: ['img/*.{png,jpg,gif,svg}'],
				dest: '<%= paths.dist %>/'
			}]
		}
	}
});

// 各種scssファイル、style.scss、アイコンフォントを用意。
grunt.registerTask('pre', ['copy', 'concat']);
// ローカルホストサーバー用意。ファイルウオッチしつつブラウザオートリーロード。
grunt.registerTask('default', ['connect', 'browserSync', 'watch']);
// style.css情報。
grunt.registerTask('stats', ['stylestats']);
// 画像圧縮。
grunt.registerTask('img', ['image']);

};
