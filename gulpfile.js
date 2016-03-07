var gulp = require('gulp');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var open = require('gulp-open');
 
gulp.task('default', ['less', 'connect', 'open', 'watch']);

gulp.task('connect', function() {
  return connect.server({
    livereload: true,
    root: ''
  });
});

gulp.task('open', function() {
  return gulp.src('')
  .pipe(open({uri: 'http://localhost:8080/'}));
});

gulp.task('less', function () {
  return gulp.src('./less/style.less')
  .pipe(less())
  .pipe(prefix())
  .pipe(gulp.dest('./css/'))
  .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('./less/**/*', ['less']);
});