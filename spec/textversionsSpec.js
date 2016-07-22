var textVerionsCore = require("../src/textversion");

describe("Empty output on empty content input", function(){
	it("returns empty", function(){
		expect(textVerionsCore("")).toEqual("\n");
	});
	it("empty body", function(){
		expect(textVerionsCore("<html>Foo<body></body></html>")).toEqual("\n");
	});
	it("no text just tags", function(){
		expect(textVerionsCore("<body><p><ul></ul></p></body>")).toEqual("\n");
	});
});

describe("empty html tags", function(){
	it("text should only remain", function(){
		expect(textVerionsCore("<p>Lorem <strong>ipsum</strong> <pre>dolorem</pre> <foo>sic</foo> amet</p>"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
});

describe("row braking stuff", function(){
	it("simple row brake", function(){
		expect(textVerionsCore("Lorem ipsum<br /> dolorem <br>sic amet"))
			.toEqual("Lorem ipsum\ndolorem \nsic amet\n");
	});
	it("simple paragraph", function(){
		expect(textVerionsCore("<p>Lorem ipsum dolorem sic amet</p>"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("simple double paragraph", function(){
		expect(textVerionsCore("<p>Lorem ipsum</p><p>dolorem sic amet</p>"))
			.toEqual("Lorem ipsum\ndolorem sic amet\n");
	});
	it("simple div", function(){
		expect(textVerionsCore("<div>Lorem ipsum dolorem sic amet</div>"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("div, p and br together", function(){
		expect(textVerionsCore("<div>Lorem <div>ipsum<p>dolor sic amet,<br /> consectetur adipiscing elit, sed do </p>eiusmod tempor </div>incididunt ut labore</div>"))
			.toEqual("Lorem \nipsum\ndolor sic amet,\nconsectetur adipiscing elit, sed do \neiusmod tempor \nincididunt ut labore\n");
	});
});

describe("link replace", function(){
	it("simple link replacement", function(){
		expect(textVerionsCore("Lorem <a href=\"here\">ipsum</a> dolorem sic amet"))
			.toEqual("Lorem [ipsum] (here) dolorem sic amet\n");
	});
	it("link replacement with function", function(){
		expect(textVerionsCore("Lorem <a href=\"here\">ipsum</a> dolorem sic amet", {linkProcess: function(href, linkText){
			return " {" + linkText+"} ["+ href + "] ";
		}}))
			.toEqual("Lorem {ipsum} [here] dolorem sic amet\n");
	});
	it("link replacement with function to discard link href", function(){
		expect(textVerionsCore("Lorem <a href=\"here\">ipsum</a> dolorem sic amet", {linkProcess: function(href, linkText){
			return linkText;
		}}))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("link replacement with function to discard link href and put braces", function(){
		expect(textVerionsCore("Lorem <a href=\"here\">ipsum</a> dolorem sic amet", {linkProcess: function(href, linkText){
			return "[" + linkText + "]";
		}}))
			.toEqual("Lorem [ipsum] dolorem sic amet\n");
	});
});

describe("image replace", function(){
	it("simple image replacement", function(){
		expect(textVerionsCore("Lorem <img src=\"imagelink\" alt=\"ipsum\"> dolorem sic amet"))
			.toEqual("Lorem ![ipsum] (imagelink) dolorem sic amet\n");
	});
	it("image replacement with function", function(){
		expect(textVerionsCore("Lorem <img src=\"imagelink\" alt=\"ipsum\"> dolorem sic amet", {imgProcess: function(src, imAlt){
			return " {" + imAlt+"} ["+ src + "] ";
		}}))
			.toEqual("Lorem {ipsum} [imagelink] dolorem sic amet\n");
	});
	it("image replacement with function to discard source", function(){
		expect(textVerionsCore("Lorem <img src=\"imagelink\" alt=\"ipsum\"> dolorem sic amet", {imgProcess: function(src, imAlt){
			return imAlt;
		}}))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("image replacement with function to discard cource and put braces", function(){
		expect(textVerionsCore("Lorem <img src=\"imagelink\" alt=\"ipsum\"> dolorem sic amet", {imgProcess: function(src, imAlt){
			return "[" + imAlt + "]";
		}}))
			.toEqual("Lorem [ipsum] dolorem sic amet\n");
	});
});

describe("headings", function(){
	it("simple heading removal", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum dolorem sic amet"))
			.toEqual("Lorem\nipsum dolorem sic amet\n");
	});
	it("heading removal with option underline", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum <h2>dolorem</h2> sic <h3>amet</h3> sic amet", {headingStyle: "underline"}))
			.toEqual("Lorem\n=====\nipsum \ndolorem\n-------\nsic \namet\nsic amet\n");
	});
	it("heading removal with option hashify", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum <h2>dolorem</h2> sic <h4>amet</h4> sic amet", {headingStyle: "hashify"}))
			.toEqual("# Lorem\nipsum \n## dolorem\nsic \n#### amet\nsic amet\n");
	});
});

describe("lists", function(){
	it("simple ulist removal", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet"))
			.toEqual("Lorem\nipsum\ndolorem sic amet\n");
	});
	it("ulist removal with option indention", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet", {listStyle: "indention"}))
			.toEqual("---Lorem\n---ipsum\ndolorem sic amet\n");
	});
	it("ulist removal with option indention and other styles", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet", {listStyle: "indention", uIndentionChar: "=", listIndentionTabs: "4"}))
			.toEqual("====Lorem\n====ipsum\ndolorem sic amet\n");
	});
	it("simple olist removal", function(){
		expect(textVerionsCore("<ol><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet"))
			.toEqual("Lorem\nipsum\ndolorem sic amet\n");
	});
	it("olist removal with option indention", function(){
		expect(textVerionsCore("<ol><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet", {listStyle: "indention"}))
			.toEqual("1--Lorem\n2--ipsum\ndolorem sic amet\n");
	});
	it("olist removal with starting value and option indention and other styles", function(){
		expect(textVerionsCore("<ol start=\"3\"><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet", {listStyle: "indention", oIndentionChar: "=", listIndentionTabs: "4"}))
			.toEqual("3===Lorem\n4===ipsum\ndolorem sic amet\n");
	});
	it("combined ulist and olist removal with starting value and option indention and other styles", function(){
		expect(textVerionsCore("<ol start=\"3\"><li>Lorem</li><li><ul><li>ipsum</li><li>dolorem</li></ul></li></ol>sic amet", {listStyle: "indention", oIndentionChar: "=", uIndentionChar: "=", listIndentionTabs: "2"}))
			.toEqual("3=Lorem\n4===ipsum\n====dolorem\nsic amet\n");
	});
});