var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minifyCSS = require('gulp-minify-css');
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

gulp.task('default', ['styles']);
gulp.task('watch', function() {
  gulp.watch(lessfiles_watch, ['styles']);
});
