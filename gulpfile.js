var gulp = require('gulp');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minifyCSS = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var dsource = "./src/";
var ddest = "./www/";

var lessfiles = [dsource+'less/styles.less'];
var lessfiles_watch = [dsource+'less/**/*.less'];

w = process.cwd();
styles = gulp.task(
  'styles',
  function() {
    return gulp.src(lessfiles)
    //~ .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename("styles.css"))
    .pipe(gulp.dest(ddest+'css/'))
    .pipe(notify({message: 'Styles task complete'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCSS())
    //~ .pipe(sourcemaps.write('../maps', {includeContent: false, sourceRoot: './theme/less'}))
    .pipe(gulp.dest(ddest+'css/'))
  });

var bootstrapjs = {
  src: [
    'js/transition.js',
    'js/alert.js',
    'js/button.js',
    'js/carousel.js',
    'js/collapse.js',
    'js/dropdown.js',
    'js/modal.js',
    'js/tooltip.js',
    'js/popover.js',
    'js/scrollspy.js',
    'js/tab.js',
    'js/affix.js'
  ],
  dir: './node_modules/bootstrap/'
};

gulp.task(
  'build-bootstrap',
  function() {
    gulp.src([bootstrapjs['dir']+'js/*.js'])
      .pipe(concat('bootstrap.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('./www/js/'))
  });

gulp.task('default', ['styles']);
gulp.task('watch', function() {
  gulp.watch(lessfiles_watch, ['styles']);
});
