const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const del = require('del'); // rm -rf
const ghPages = require('gulp-gh-pages');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const jsmin = require('gulp-jsmin');
const minifycss = require('gulp-minify-css');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');

var DEST = './src';

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: './src'
		}
	});
});

gulp.task('bs-reload', function () {
	browserSync.reload();
});

gulp.task('images', function () {
	gulp
		.src('src/assets/img/**/*')
		.pipe(
			cache(
				imagemin({
					optimizationLevel: 3,
					progressive: true,
					interlaced: true
				})
			)
		)
		.pipe(gulp.dest(DEST + '/assets/img/'));
});

gulp.task('sass', function () {
	gulp
		.src(['./src/assets/scss/**/*.scss'])
		.pipe(
			plumber({
				errorHandler: function (error) {
					console.log(error.message);
					this.emit('end');
				}
			})
		)
		.pipe(sass())
		.pipe(autoprefixer('last 2 versions'))
		.pipe(gulp.dest(DEST + '/assets/css/'))
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(minifycss())
		.pipe(gulp.dest(DEST + '/assets/css/'))
		.pipe(
			browserSync.reload({
				stream: true
			})
		);
});

gulp.task('third-party-css', function () {
	gulp
		.src('src/assets/css/third-party/**/*')
		.pipe(gulp.dest(DEST + '/assets/css/third-party/'));
});

// Compile Bootstrap SASS files into CSS FILES
gulp.task('bootstrap', () => {
	gulp
		.src(['./node_modules/bootstrap/scss/bootstrap.scss'])
		.pipe(
			plumber({
				errorHandler: function (error) {
					console.log(error.message);
					this.emit('end');
				}
			})
		)
		.pipe(sass())
		.pipe(autoprefixer('last 2 versions'))
		.pipe(gulp.dest(DEST + '/assets/css/'))
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(minifycss())
		.pipe(gulp.dest(DEST + '/assets/css/'))
		.pipe(
			browserSync.reload({
				stream: true
			})
		);
});

// Compile External JS files into one file
gulp.task('lib', () => {
	gulp
		.src([
			'./node_modules/jquery/dist/jquery.min.js',
			'./node_modules/vue/dist/vue.min.js'
		])
		.pipe(concat('lib.js'))
		.pipe(jsmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(DEST + '/assets/js/'));
});

// Compile JS files into one file
gulp.task('js', () => {
	gulp
		.src('./src/assets/js/**/*.js')
		.pipe(concat('main.js'))
		.pipe(jsmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(DEST + '/assets/js/'));
});

gulp.task('html', () => {
	gulp.src('src/**/*.html').pipe(gulp.dest(DEST));
});

// Clean dist folder before rebuild
gulp.task('clean', function () {
	return del(['./dist']);
});

gulp.task('default', ['develop', 'sass', 'browser-sync'], function () {
	gulp.watch('src/assets/scss/**/*.scss', ['sass', 'bs-reload']);
	gulp.watch('src/assets/js/**/*.js', ['js']);
	gulp.watch('src/*.html', ['bs-reload']);
});


gulp.task('build', sequence('clean', ['production', 'sass', 'third-party-css', 'js', 'images', 'html']));

gulp.task('develop', () => {
	DEST = './src';
});

gulp.task('production', () => {
	DEST = './dist';
});

gulp.task('deploy', function () {
	return gulp.src('./dist/**/*')
		.pipe(ghPages());
});
