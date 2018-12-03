const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const del = require('del'); // rm -rf
const ghPages = require('gulp-gh-pages');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const jsmin = require('gulp-jsmin');
const minifycss = require('gulp-minify-css');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

var DEST = 'src/';

var paths = {
  project: {
    src: 'src/',
    dest_dir: 'dist/',
    dest_files: 'dist/**/*',
  },
  html: {
    src: 'src/**/*.html',
    dest: DEST,
  },
  images: {
    src: 'src/assets/img/**/*',
    dest: DEST.concat('assets/img/'),
  },
  scripts: {
    src: 'src/assets/js/**/*.js',
    dest: DEST.concat('assets/js/3rd'),
  },
  scripts_3rd: {
    src: ['./node_modules/vue/dist/vue.min.js'],
    dest: DEST.concat('assets/js'),
  },
  styles_css: {
    src: 'src/assets/css/*.css',
    dest: DEST.concat('assets/css/'),
  },
  styles_sass: {
    src: 'src/assets/scss/**/*.scss',
    dest: DEST.concat('assets/css/'),
  },
  styles_3rd: {
    src: 'src/assets/css/3rd/**/*',
    dest: DEST.concat('assets/css/3rd/'),
  },
  styles_bootstrap: {
    src: './node_modules/bootstrap/scss/bootstrap.scss',
    dest: DEST.concat('assets/css/3rd/'),
  },
};

function updatePaths() {
  paths.html.dest = DEST;
  paths.images.dest = DEST.concat('assets/img/');
  paths.scripts.dest = DEST.concat('assets/js/3rd');
  paths.scripts_3rd.dest = DEST.concat('assets/js');
  paths.styles_3rd.dest = DEST.concat('assets/css/3rd/');
  paths.styles_bootstrap.dest = DEST.concat('assets/css/3rd/');
  paths.styles_css.dest = DEST.concat('assets/css/');
  paths.styles_sass.dest = DEST.concat('assets/css/');
}

gulp.task('images', (done) => {
  gulp
    .src(paths.images.src)
    .pipe(
      cache(
        imagemin({
          optimizationLevel: 3,
          progressive: true,
          interlaced: true,
        }),
      ),
    )
    .pipe(gulp.dest(paths.images.dest));
  done();
});

gulp.task('sass', (done) => {
  gulp
    .src([paths.styles_sass.src])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles_sass.dest));
  done();
});

gulp.task('third-party-css', (done) => {
  gulp.src(paths.styles_3rd.src).pipe(gulp.dest(paths.styles_3rd.dest));
  done();
});

// Compile Bootstrap SASS files into CSS FILES
gulp.task('bootstrap', (done) => {
  gulp
    .src([paths.styles_bootstrap.src])
    .pipe(
      plumber({
        errorHandler: function(error) {
          console.log(error.message);
          this.emit('end');
        },
      }),
    )
    .pipe(sass())
    .pipe(gulp.dest(paths.styles_bootstrap.dest))
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(minifycss())
    .pipe(gulp.dest(paths.styles_bootstrap.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
  done();
});

// Compile External JS files into one file
gulp.task('lib', (done) => {
  gulp
    .src(paths.scripts_3rd.src)
    .pipe(concat('lib.js'))
    .pipe(jsmin())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest(paths.scripts_3rd.dest));
  done();
});

// Compile JS files into one file
gulp.task('js', (done) => {
  gulp
    .src(paths.scripts.src)
    .pipe(concat('main.js'))
    .pipe(jsmin())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest(paths.scripts.dest));
  done();
});

gulp.task('html', (done) => {
  gulp.src(paths.html.src).pipe(gulp.dest(paths.html.dest));
  done();
});

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './src',
    },
  });
  gulp.watch(paths.html.src).on('change', reload);
  gulp.watch(paths.styles_sass.src).on('change', gulp.series('sass', reload));
});

// Clean dist folder before rebuild
gulp.task('clean', (done) => {
  del([paths.project.dest_dir]);
  done();
});

gulp.task('develop', (done) => {
  DEST = paths.project.src;
  updatePaths();
  done();
});

gulp.task('production', (done) => {
  DEST = paths.project.dest_dir;
  updatePaths();
  done();
});

gulp.task('deploy', function() {
  return gulp.src(paths.project.dest_files).pipe(ghPages());
});

gulp.task(
  'default',
  gulp.series('develop', 'sass', 'serve', () => {
    gulp.watch(paths.scripts.src, ['js']);
  }),
);

gulp.task(
  'build',
  gulp.series(
    'clean',
    'production',
    gulp.parallel('sass', 'third-party-css', 'js', 'images', 'html'),
  ),
);
