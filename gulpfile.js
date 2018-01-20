var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer')
 
gulp.task('sass', function () {
  return gulp.src('./public/stylesheets/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
			browsers: [
			'last 15 version','>1%','ie 8','ie 9','Opera 12.1'
			]
		}))
    .pipe(gulp.dest('./public/stylesheets/'));
});

gulp.task('watch',function(){
	gulp.watch('public/stylesheets/**/*.scss',gulp.series('sass'));
})