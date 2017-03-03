var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
//var autoprefixer = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');
var csscomb = require('gulp-csscomb'); // css整形
var plumber = require('gulp-plumber'); // エラーが起きてもwatchを終了しない
var notify = require('gulp-notify'); // エラーが起こったときの通知
// var using = require('gulp-using'); // タスクが処理をしているファイル名を出力
// var cached = require('gulp-cached'); // 変更があったファイルにだけ処理を行う
// var remember = require('gulp-remember'); // キャッシュしたストリームを取り出す
var spritesmith = require('gulp.spritesmith'); // スプライトイメージ作成
var iconfont = require('gulp-iconfont'); // アイコンフォント作成
var consolidate = require('gulp-consolidate'); // アイコンフォント作成
var useref = require('gulp-useref'); // HTML内読み込み外部ファイルを結合する <!-- bulid:js -->等
var uncss = require('gulp-uncss'); // 未使用CSSセレクターを削除
var glob = require('glob'); // セレクターの使用状況を判別するためのHTMLを指定
// var runSequence = require('run-sequence'); // 順番に実行してほしいタスク名を指定

var path = {
    srcScss: './source/scss/',
    srcSprite: './source/sprite-img/',
    srcSvg: './source/svg/',
    dest: './htdocs/',
    destCss: './htdocs/css/',
    destImg: './htdocs/img/',
    destJs: './htdocs/js/',
    destFont: './htdocs/fonts/'
//    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
};

// エラー通知が必要なタスク使用。通知が必要ない場合には通常のplumberをとるようにする
// .pipe(plumberWithNotify()) or .pipe(plumber())
function plumberWithNotify() {
    return plumber({errorHandler: notify.onError("<%= error.message %>")});
}

// Bootstrap Sassファイル、fontファイル、Animate Sassファイルをコピー
gulp.task('preCopy', function() {
    gulp.src('./bower_components/bootstrap-sass/assets/stylesheets/**/*')
    .pipe(gulp.dest(path.srcScss));
    gulp.src('./bower_components/bootstrap-sass/assets/fonts/bootstrap/*')
    .pipe(gulp.dest(path.dest + 'fonts/'));
    gulp.src('./bower_components/animate-sass/**/*')
    .pipe(gulp.dest(path.srcScss + 'animate/'));
});

// _bootstrap.scssをリネーム
gulp.task('rename', function(){
    gulp.src(path.srcScss + '_bootstrap.scss')
    .pipe(rename('bootstrap.scss'))
    .pipe(gulp.dest(path.srcScss));
});

// 読み込むSassファイル作成
gulp.task('preConcat', function() {
    gulp.src([path.srcScss + 'bootstrap.scss', path.srcScss + 'add-style.scss'])
    .pipe(concat('style.scss'))
    .pipe(gulp.dest(path.srcScss));
});

// コンパイル環境セット　デフォルト：development(作成時) コマンドライン：gulp
var isDev = true;
var isProd = false;

// production(納品時)　コマンドライン：gulp --type production
if(gutil.env.type === 'production') {
  isDev  = false;
  isProd = true;
}

// libsassコンパイル
gulp.task('sass', function () {
    return gulp.src(path.srcScss + 'style.scss')
    .pipe(plumberWithNotify())
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 version','ie >= 9'] }) ]))
    .pipe(gulpif(isProd, csscomb()))
    .pipe(gulpif(isDev, sourcemaps.write('.')))
    .pipe(gulp.dest(path.destCss));
});

// 画像圧縮
gulp.task('images', function() {
  gulp.src(path.destImg + '*.{gif,jpg,png}')
//		.pipe(changed(path.destImg))
  .pipe(imagemin({ optimizationLevel: 5 }))
  .pipe(gulp.dest(path.destImg));
});

// ローカルサーバー＋監視
gulp.task('serve', ['sass', 'images'], function() {
    browserSync.init({
        server: {
            baseDir: path.dest,
            directory: true
        }
    });
    gulp.watch(path.srcScss + '**/*.scss', ['sass']);
//    gulp.watch(path.srcImg + '*.{gif,jpg,png}', ['images']);
    gulp.watch([
        path.dest + '*.html',
        path.destCss + '*.css',
        path.destJs + '*.js'
    ]).on('change', browserSync.reload);
});

// スプライトイメージ作成
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(path.srcSprite + '*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_img-sprite.scss',
//    algorithm: 'binary-tree',
    imgPath: '../img/sprite.png'
  }));
  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(gulp.dest(path.destImg));
  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(gulp.dest(path.srcScss));
});

// アイコンフォント作成
var fontName = 'iconfont';
gulp.task('iconfont', function(){
    gulp.src([path.srcSvg + '*.svg'])
    .pipe(iconfont({
        fontName: fontName,
        normalize: true
    }))
    .on('glyphs', function(glyphs) {
        var options = {
        glyphs: glyphs.map(function(glyph) {
          // this line is needed because gulp-iconfont has changed the api from 2.0
          return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) }
        }),
        fontName: fontName,
        fontPath: '../fonts/', // set path to font (from your CSS file if relative)
        className: 'iconfont' // set class name in your CSS
        };
        gulp.src(path.srcScss + 'iconfont/_iconfont.scss')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:fontName }))
        .pipe(gulp.dest(path.srcScss)); // set path to export your CSS
    })
    .pipe(gulp.dest(path.destFont)); // set path to export your fonts
});

// jsファイル等を結合 build〜endbuildを結合
gulp.task('fileconcat', function () {
    return gulp.src(path.dest + '*.html')
        .pipe(useref())
        .pipe(gulp.dest(path.dest));
});

// 未使用CSSセレクタ削除
gulp.task('delselector', function(){
    return gulp.src(path.destCss + 'style.css')
        .pipe(uncss({
            html: glob.sync(path.dest + '*.html'),
            ignore: [
                /\.open/,
                /\.active/,
                /\.collapse/,
                /\.tooltip/,
                /\.popover/,
                /\.carousel/,
                /\.in/
            ]
        }))
        .pipe(gulp.dest(path.destCss));
})

// デフォルト ローカルサーバーを起ち上げ、ファイルを監視しつつ、ブラウザオートリロード
gulp.task('default', ['serve']);
