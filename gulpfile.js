var gulp = require("gulp");
var jscs = require("gulp-jscs");
var jshint = require("gulp-jshint");
var stylish = require("gulp-jscs-stylish");
var jsonlint = require("gulp-jsonlint");
var jasmine = require("gulp-jasmine");

var jsFiles = [
	"./**/*.js",
	"!node_modules/**/*"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc"
];

// JSON lint
// ==================================================
gulp.task("jsonlint", function() {
	return gulp.src(jsonFiles)
		.pipe(jsonlint())
		.pipe(jsonlint.failOnError());
});


// JS Hint
// ==================================================
gulp.task("jshint", function() {
	return gulp.src(jsFiles)
		.pipe(jshint(".jshintrc"))
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(jshint.reporter("fail"));
});


// JS CodeStyle
// ==================================================
gulp.task("jscs", function() {
	return gulp.src(jsFiles)
		.pipe(jscs({
			configPath: ".jscsrc",
			fix: true
		}))
		.pipe(stylish())
		.pipe(jscs.reporter("fail"));
});

// Test
// ==================================================
gulp.task("jasmine", function() {
	return gulp.src("spec/**/*Spec.js")
		.pipe(jasmine({
			verbose: true
		}));
});

gulp.task("test", ["jsonlint", "jshint", "jscs", "jasmine"]);
