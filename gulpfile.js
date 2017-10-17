"use strict";

var gulp = require("gulp");
var createSuperGulp = require("edm-supergulp");

var superGulp = createSuperGulp({
	gulp: gulp
});

var packageJson = require("./package.json");

var jsFiles = [
	"./*.js",
	"./src/**/*.js",
	"./spec/**/*.js",
	"./examples/*.js"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc",
	"./package.json",
	"./src/**/*.json",
	"./spec/**/*.json",
	"./examples/*.json"
];

var specFiles = [
	"spec/**/*Spec.js"
];

var sourceFiles = [
	"src/**/*.js"
];

superGulp.taskTemplates.initFrontendTasks({
	packageJson: packageJson,
	coverage: 70,
	files: {
		js: jsFiles,
		json: jsonFiles,
		spec: specFiles,
		source: sourceFiles
	},
	tasks: {
		copy: {
			common: [
				{ files: "./img/*", dest: "./dist/img/"},
				{ files: "./lib/**/*", dest: "./dist/lib/"},
				{ files: "./example/fonts/*", dest: "./dist/lib/fonts/"},
				{ files: "./css/*", dest: "./dist/"}
			],
			dev: [
				{ files: "./example/css/*", dest: "./dist/"},
				{ files: "./example/index.html", dest: "./dist/"},
				{ files: "./example/img/*", dest: "./dist/img/"},
			]
		},
		js: {
			common: [
				{
					entries: ["./src/textversion.js"],
					outputFileName: "textversion.js",
					standaloneName: "textversion",
					destFolder: "./docs/js/"
				}
			]
		}
	}
});
