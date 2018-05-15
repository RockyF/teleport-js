/**
 * Created by rockyl on 2018/5/15.
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

gulp.task('default', () =>
	gulp.src(['src/protobuf.js', 'src/protocol.js', 'src/teleport.js', 'src/index.js'])
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(concat('teleport.js'))
		.pipe(gulp.dest('dist'))
);