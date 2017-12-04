# textversionjs

Generate the text version of your HTML email in a second.

This tool is an open source project. Feel free to use it any time in your projects!

## htmlToPlainText

The function that generates plain text from email htmls.

### Params

Param       | Type     | Required     | Default value | Description
---         |---       |---           |---            |---
htmlText    | string   | Yes          |               | The html version of the email
styleConfig | json     | No           |               | Options for converting

### styleConfig

Param             | Type     | Required     | Default value | Description
---               |---       |---           |---            |---
linkProcess       | function | No           |               | Callback function to customize links appearance
imgProcess        | function | No           |               | Callback function to customize image appearance
headingStyle      | string   | No           | "underline"   | Define heading appearance, options: "underline", "linebreak", "hashify"
listStyle         | string   | No           | "indention"   | Define list appearance, options: "indention", "linebreak"
uIndentionChar    | string   | No           | "-"           | If listStyle is indention, uIndentionChar is the character that fills the indention for unordered lists
oIndentionChar    | string   | No           | "-"           | If listStyle is indention, oIndentionChar is the character that fills the indention for ordered lists after the heading number
listIndentionTabs | int      | No           | 3             | If listStyle is indention, listIndentionTabs is the width of the indention
keepNbsps         | boolean  | No           | false         | Define the behaviour of the non-braking spaces. If set to true, nbsps are not collapsed to single space.

### linkProcess

Param       | Type     | Required     | Default value | Description
---         |---       |---           |---            |---
href        | string   | Yes          |               | The destination (href property) of the link
linkText    | string   | Yes          |               | The text of the link

### imgProcess

Param       | Type     | Required     | Default value | Description
---         |---       |---           |---            |---
src         | string   | Yes          |               | The source (src property) of the image
alt         | string   | Yes          |               | The alternative text (alt property) of the image

### Examples

#### Simple conversion with default style

```js
var textVersion = require("textversionjs");
var htmlText = "<html>" +
					"<body>" +
						"Lorem ipsum <a href=\"http://foo.foo\">dolor</a> sic <strong>amet</strong><br />" +
						"Lorem ipsum <img src=\"http://foo.jpg\" alt=\"foo\" /> sic <pre>amet</pre>" +
						"<p>Lorem ipsum dolor <br /> sic amet</p>" +
						"<script>" +
							"alert(\"nothing\");" +
						"</script>" +
					"</body>" +
				"</html>";

var plainText = textVersion(htmlText);
// returns
// "Lorem ipsum [dolor] (http://foo.foo) sic amet
// Lorem ipsum ![foo] (http://foo.jpg) sic amet
// Lorem ipsum dolor
// sic amet"

```

#### Customize link appearance

```js
var textVersion = require("textversionjs");
var htmlText = "<p>Lorem <a href=\"http://foo.foo\">ipsum</a> dolor sic amet</p>";

var styleConfig: {
	linkStyle: function(href, linkText){
		return linkText + " " + "(" + href + ")";
	}
};

var plainText = textVersion(htmlText, styleConfig);
// returns "Lorem ipsum (http://foo.foo) dolor sic amet"

```

#### Customize headings

```js
var textVersion = require("textversionjs");

var htmlText = "<h1>Lorem ipsum</h1>" +
				"<p>Lorem ipsum dolor sic amet</p>";

var styleConfig: {
	headingStyle: "hashify"
};

var plainText = textVersion(htmlText, styleConfig);
// returns
// "# Lorem ipsum
//
// Lorem ipsum dolor sic amet"

```

#### Customize lists

```js
var textVersion = require("textversionjs");
var htmlText = "<ul>" +
					"<li>Lorem</li>" +
					"<li>ipsum</li>" +
				"</ul>" +
				"<ol>" +
					"<li start=\"3\">Lorem</li>" +
					"<li>ipsum</li>" +
				"</ol>";

var styleConfig: {
	headingStyle: "indention",
	uIndentionChar: ".";
	listIndentionTabs: 2;
};

var plainText = textVersion(htmlText, styleConfig);
// returns "
// ..Lorem
// ..ipsum
// 3.Lorem
// 4.ipsum"
```

Try it online in our [Demo page](http://emailtextversion.com/)!

Don't forget to check out our other open source projects at [EDMdesigner](https://edmdesigner.com/).

Follow us on [github](https://github.com/EDMdesigner) and [twitter](https://twitter.com/EDMdesigner)!