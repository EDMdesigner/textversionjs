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
	it("simple image replacement if no alt is present", function(){
		expect(textVerionsCore("Lorem <img src=\"imagelink\" alt=\"\"> dolorem sic amet"))
			.toEqual("Lorem ![image] (imagelink) dolorem sic amet\n");
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
	it("simple heading with underline", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum <h2>dolorem</h2> sic <h3>amet</h3> sic amet"))
			.toEqual("Lorem\n=====\n\nipsum \n\ndolorem\n-------\n\nsic \n\namet\n\nsic amet\n");
	});
	it("heading with underline other tags within", function(){
		expect(textVerionsCore("<h1><span>Lorem</span></h1> ipsum <h2>dolorem</h2> sic <h3>amet</h3> sic amet"))
			.toEqual("Lorem\n=====\n\nipsum \n\ndolorem\n-------\n\nsic \n\namet\n\nsic amet\n");
	});
	it("heading removal with option linebreak", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum dolorem sic amet", {headingStyle: "linebreak"}))
			.toEqual("Lorem\nipsum dolorem sic amet\n");
	});
	it("heading removal with option hashify", function(){
		expect(textVerionsCore("<h1>Lorem</h1> ipsum <h2>dolorem</h2> sic <h4>amet</h4> sic amet", {headingStyle: "hashify"}))
			.toEqual("# Lorem\n\nipsum \n\n## dolorem\n\nsic \n\n#### amet\n\nsic amet\n");
	});
});

describe("lists", function(){
	it("ulist removal with option linebreak", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet", {listStyle: "linebreak"}))
			.toEqual("Lorem\nipsum\ndolorem sic amet\n");
	});
	it("simple ulist removal", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet"))
			.toEqual("---Lorem\n---ipsum\ndolorem sic amet\n");
	});
	it("ulist removal with option indention and other styles", function(){
		expect(textVerionsCore("<ul><li>Lorem</li><li>ipsum</li></ul> dolorem sic amet", {listStyle: "indention", uIndentionChar: "=", listIndentionTabs: "4"}))
			.toEqual("====Lorem\n====ipsum\ndolorem sic amet\n");
	});
	it("simple olist removal", function(){
		expect(textVerionsCore("<ol><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet"))
			.toEqual("1--Lorem\n2--ipsum\ndolorem sic amet\n");
	});
	it("olist removal with option linebreak", function(){
		expect(textVerionsCore("<ol><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet", {listStyle: "linebreak"}))
			.toEqual("Lorem\nipsum\ndolorem sic amet\n");
	});
	it("olist removal with starting value and option indention and other styles", function(){
		expect(textVerionsCore("<ol start=\"31\"><li>Lorem</li><li>ipsum</li></ol> dolorem sic amet", {listStyle: "indention", oIndentionChar: "=", listIndentionTabs: "4"}))
			.toEqual("31==Lorem\n32==ipsum\ndolorem sic amet\n");
	});
	it("combined ulist and olist removal with starting value and option indention and other styles", function(){
		expect(textVerionsCore("<ol start=\"3\"><li>Lorem</li><li><ul><li>ipsum</li><li>dolorem</li></ul></li></ol>sic amet", {listStyle: "indention", oIndentionChar: "=", uIndentionChar: "=", listIndentionTabs: "2"}))
			.toEqual("3=Lorem\n4===ipsum\n====dolorem\nsic amet\n");
	});
});

describe("remove full blocks when needed", function(){
	it("remove body scripts", function(){
		expect(textVerionsCore("<script>var a=2</script>\nLorem ipsum dolorem <script type=\"text/js\">alert(\"hello world\");\nalert(\"nothing\")</script>sic amet</div>"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("remove body styles", function(){
		expect(textVerionsCore("<style>div {\n    display: block;\n}</style>\nLorem ipsum dolorem <style type=\"text/css\">.page-content {\npadding: 30px 0;\n}\n</style>sic amet</div>"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
	it("remove body comments", function(){
		expect(textVerionsCore("Lorem ipsum dolorem <!--foo\nfoo--> sic amet<!--foo-->"))
			.toEqual("Lorem ipsum dolorem sic amet\n");
	});
});

describe("pasting from editors", function(){
	it("google doc styling meta tag", function(){
		expect(textVerionsCore("<meta charset=\"utf-8\"><span style=\"font-size:30.666666666666664px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;\">line 1</span>"))
			.toEqual("line 1\n");
	});
	it("ms word styling <o:p>", function(){
		expect(textVerionsCore("<span lang=EN-US style='font-size:10.5pt;line-height:107%; font-family:\"Arial\",sans-serif;color:#333333;mso-ansi-language:EN-US'>Line 2</span><span lang=EN-US style='mso-ansi-language:EN-US'><o:p></o:p></span>"))
			.toEqual("Line 2\n");
	});
	it("fix special tag endings", function(){
		expect(textVerionsCore("<span test=\"a \" lang=EN-US style='font-size:10.5pt;line-height:107%; font-family:\"Arial\",sans-serif;color:#333333;mso-ansi-language:EN-US'>A</span>"))
			.toEqual("A\n");
	});
});
