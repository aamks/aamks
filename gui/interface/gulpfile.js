var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var sass = require('gulp-sass');

var plumber = require('gulp-plumber');

var paths = {
	'src':['./scripts/**/*.js']

,
	'style': {
		all: './styles/scss/**/*.scss',
		output: './styles/'
	}
};

gulp.task('watch:sass', function () {
	gulp.watch(paths.style.all, ['sass']);
});

gulp.task('sass', function(){
	gulp.src(paths.style.all)
		.pipe(plumber())
		.pipe(sass({includePaths: ['css/scss/bourbon/app/assets/stylesheets', 'css/scss/mdi/scss']}).on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});

gulp.task('watch', [
	'watch:sass'
]);


