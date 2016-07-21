var textVerionsCore = require("../src/textversions");

describe("Empty output on empty body input", function(){
	it("returns empty", function(){
		expect(textVerionsCore("")).toEqual("");
	});
	it("returns empty", function(){
		expect(textVerionsCore("<html>Foo<body></body></html>")).toEqual("");
	});
	it("returns empty", function(){
		expect(textVerionsCore("<body><p></p></body>")).toEqual("");
	});
});