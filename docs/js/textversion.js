(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.textversion = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/smiska/workspace/EDMdesigner/textversionjs/src/textversion.js":[function(require,module,exports){
"use strict";

var populateChar = function populateChar(ch, amount) {
	var result = "";
	for (var i = 0; i < amount; i += 1) {
		result += ch;
	}
	return result;
};

function htmlToPlainText(htmlText, styleConfig) {

	// define default styleConfig
	var linkProcess = null;
	var imgProcess = null;
	var headingStyle = "underline"; // hashify, breakline
	var listStyle = "indention"; // indention, linebreak
	var uIndentionChar = "-";
	var listIndentionTabs = 3;
	var oIndentionChar = "-";

	// or accept user defined config
	if (!!styleConfig) {
		if (typeof styleConfig.linkProcess === "function") {
			linkProcess = styleConfig.linkProcess;
		}
		if (typeof styleConfig.imgProcess === "function") {
			imgProcess = styleConfig.imgProcess;
		}
		if (!!styleConfig.headingStyle) {
			headingStyle = styleConfig.headingStyle;
		}
		if (!!styleConfig.listStyle) {
			listStyle = styleConfig.listStyle;
		}
		if (!!styleConfig.uIndentionChar) {
			uIndentionChar = styleConfig.uIndentionChar;
		}
		if (!!styleConfig.listIndentionTabs) {
			listIndentionTabs = styleConfig.listIndentionTabs;
		}
		if (!!styleConfig.oIndentionChar) {
			oIndentionChar = styleConfig.oIndentionChar;
		}
	}

	var uIndention = populateChar(uIndentionChar, listIndentionTabs);

	// removel all \n linebreaks
	var tmp = String(htmlText).replace(/\n|\r/g, " ");

	// remove everything before and after <body> tags including the tag itself
	tmp = tmp.replace(/<\/body>.*/i, "");
	tmp = tmp.replace(/.*<body[^>]*>/i, "");

	// remove inbody scripts and styles
	tmp = tmp.replace(/<(script|style)( [^>]*)*>((?!<\/\1( [^>]*)*>).)*<\/\1>/gi, "");

	// remove all tags except that are being handled separately
	tmp = tmp.replace(/<(\/)?((?!h[1-6]( [^>]*)*>)(?!img( [^>]*)*>)(?!a( [^>]*)*>)(?!ul( [^>]*)*>)(?!ol( [^>]*)*>)(?!li( [^>]*)*>)(?!p( [^>]*)*>)(?!div( [^>]*)*>)(?!td( [^>]*)*>)(?!br( [^>]*)*>)[^>\/])[^>]*>/gi, "");

	// remove or replace images - replacement texts with <> tags will be removed also, if not intentional, try to use other notation
	tmp = tmp.replace(/<img([^>]*)>/gi, function (str, imAttrs) {
		var imSrc = "";
		var imAlt = "";
		var imSrcResult = /src="([^"]*)"/i.exec(imAttrs);
		var imAltResult = /alt="([^"]*)"/i.exec(imAttrs);
		if (imSrcResult !== null) {
			imSrc = imSrcResult[1];
		}
		if (imAltResult !== null) {
			imAlt = imAltResult[1];
		}
		if (typeof imgProcess === "function") {
			return imgProcess(imSrc, imAlt);
		}
		if (imAlt === "") {
			return "![image] (" + imSrc + ")";
		}
		return "![" + imAlt + "] (" + imSrc + ")";
	});

	function createListReplaceCb() {
		return function (match, listType, listAttributes, listBody) {
			var liIndex = 0;
			if (listAttributes && /start="([0-9]+)"/i.test(listAttributes)) {
				liIndex = /start="([0-9]+)"/i.exec(listAttributes)[1] - 1;
			}
			var plainListItem = "<p>" + listBody.replace(/<li[^>]*>(((?!<li[^>]*>)(?!<\/li>).)*)<\/li>/gi, function (str, listItem) {
				var actSubIndex = 0;
				var plainListLine = listItem.replace(/(^|(<br \/>))(?!<p>)/gi, function () {
					if (listType === "o" && actSubIndex === 0) {
						liIndex += 1;
						actSubIndex += 1;
						return "<br />" + liIndex + populateChar(oIndentionChar, listIndentionTabs - String(liIndex).length);
					}
					return "<br />" + uIndention;
				});
				return plainListLine;
			}) + "</p>";
			return plainListItem;
		};
	}

	// handle lists
	if (listStyle === "linebreak") {
		tmp = tmp.replace(/<\/?ul[^>]*>|<\/?ol[^>]*>|<\/?li[^>]*>/gi, "\n");
	} else if (listStyle === "indention") {
		while (/<(o|u)l[^>]*>(.*)<\/\1l>/gi.test(tmp)) {
			tmp = tmp.replace(/<(o|u)l([^>]*)>(((?!<(o|u)l[^>]*>)(?!<\/(o|u)l>).)*)<\/\1l>/gi, createListReplaceCb());
		}
	}

	// handle headings
	if (headingStyle === "linebreak") {
		tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, "\n$2\n");
	} else if (headingStyle === "underline") {
		tmp = tmp.replace(/<h1[^>]*>(((?!<\/h1>).)*)<\/h1>/gi, function (str, p1) {
			return "\n&nbsp;\n" + p1 + "\n" + populateChar("=", p1.length) + "\n&nbsp;\n";
		});
		tmp = tmp.replace(/<h2[^>]*>(((?!<\/h2>).)*)<\/h2>/gi, function (str, p1) {
			return "\n&nbsp;\n" + p1 + "\n" + populateChar("-", p1.length) + "\n&nbsp;\n";
		});
		tmp = tmp.replace(/<h([3-6])[^>]*>(((?!<\/h\1>).)*)<\/h\1>/gi, function (str, p1, p2) {
			return "\n&nbsp;\n" + p2 + "\n&nbsp;\n";
		});
	} else if (headingStyle === "hashify") {
		tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, function (str, p1, p2) {
			return "\n&nbsp;\n" + populateChar("#", p1) + " " + p2 + "\n&nbsp;\n";
		});
	}

	// replace <br>s, <td>s, <divs> and <p>s with linebreaks
	tmp = tmp.replace(/<br( [^>]*)*>|<p( [^>]*)*>|<\/p( [^>]*)*>|<div( [^>]*)*>|<\/div( [^>]*)*>|<td( [^>]*)*>|<\/td( [^>]*)*>/gi, "\n");

	// replace <a href>b<a> links with b (href) or as described in the linkProcess function
	tmp = tmp.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a[^>]*>/gi, function (str, href, linkText) {
		if (typeof linkProcess === "function") {
			return linkProcess(href, linkText);
		}
		return " [" + linkText + "] (" + href + ") ";
	});

	// remove whitespace from empty lines excluding nbsp
	tmp = tmp.replace(/\n[ \t\f]*/gi, "\n");

	// remove duplicated empty lines
	tmp = tmp.replace(/\n\n+/gi, "\n");

	// remove duplicated spaces including non braking spaces
	tmp = tmp.replace(/( |&nbsp;|\t)+/gi, " ");

	// remove line starter spaces
	tmp = tmp.replace(/\n +/gi, "\n");

	// remove content starter spaces
	tmp = tmp.replace(/^ +/gi, "");

	// remove first empty line
	while (tmp.indexOf("\n") === 0) {
		tmp = tmp.substring(1);
	}

	// put a new line at the end
	if (tmp.length === 0 || tmp.lastIndexOf("\n") !== tmp.length - 1) {
		tmp += "\n";
	}

	return tmp;
}

(function (name, definition) {
	if (this && typeof this.define === "function") {
		// AMD
		this.define(definition);
	} else if (typeof module !== "undefined" && module.exports) {
		// Node.js
		module.exports = definition();
	} else {
		// Browser
		var theModule = definition();
		var global = this;
		var old = global[name];
		theModule.noConflict = function () {
			global[name] = old;
			return theModule;
		};
		global[name] = theModule;
	}
})("createTextVersion", function () {
	return htmlToPlainText;
});

},{}]},{},["/home/smiska/workspace/EDMdesigner/textversionjs/src/textversion.js"])("/home/smiska/workspace/EDMdesigner/textversionjs/src/textversion.js")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdGV4dHZlcnNpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksZUFBZSxTQUFmLFlBQWUsQ0FBUyxFQUFULEVBQWEsTUFBYixFQUFvQjtBQUN0QyxLQUFJLFNBQVMsRUFBYjtBQUNBLE1BQUksSUFBSSxJQUFFLENBQVYsRUFBYSxJQUFFLE1BQWYsRUFBdUIsS0FBSyxDQUE1QixFQUE4QjtBQUM3QixZQUFVLEVBQVY7QUFDQTtBQUNELFFBQU8sTUFBUDtBQUNBLENBTkQ7O0FBUUEsU0FBUyxlQUFULENBQXlCLFFBQXpCLEVBQW1DLFdBQW5DLEVBQWdEOztBQUUvQztBQUNBLEtBQUksY0FBYyxJQUFsQjtBQUNBLEtBQUksYUFBYSxJQUFqQjtBQUNBLEtBQUksZUFBZSxXQUFuQixDQUwrQyxDQUtmO0FBQ2hDLEtBQUksWUFBWSxXQUFoQixDQU4rQyxDQU1sQjtBQUM3QixLQUFJLGlCQUFpQixHQUFyQjtBQUNBLEtBQUksb0JBQW9CLENBQXhCO0FBQ0EsS0FBSSxpQkFBaUIsR0FBckI7O0FBRUE7QUFDQSxLQUFHLENBQUMsQ0FBQyxXQUFMLEVBQWlCO0FBQ2hCLE1BQUcsT0FBTyxZQUFZLFdBQW5CLEtBQW1DLFVBQXRDLEVBQWtEO0FBQ2pELGlCQUFjLFlBQVksV0FBMUI7QUFDQTtBQUNELE1BQUcsT0FBTyxZQUFZLFVBQW5CLEtBQWtDLFVBQXJDLEVBQWlEO0FBQ2hELGdCQUFhLFlBQVksVUFBekI7QUFDQTtBQUNELE1BQUcsQ0FBQyxDQUFDLFlBQVksWUFBakIsRUFBK0I7QUFDOUIsa0JBQWUsWUFBWSxZQUEzQjtBQUNBO0FBQ0QsTUFBRyxDQUFDLENBQUMsWUFBWSxTQUFqQixFQUE0QjtBQUMzQixlQUFZLFlBQVksU0FBeEI7QUFDQTtBQUNELE1BQUcsQ0FBQyxDQUFDLFlBQVksY0FBakIsRUFBaUM7QUFDaEMsb0JBQWlCLFlBQVksY0FBN0I7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QUVPLElBQUksT0FBTyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDLE9BQU8sT0FBNUMsRUFBcUQ7QUFBRTtBQUM3RCxTQUFPLE9BQVAsR0FBaUIsWUFBakI7QUFDQSxFQUZNLE1BRUE7QUFBRTtBQUNSLE1BQUksWUFBWSxZQUFoQjtBQUNBLE1BQUksU0FBUyxJQUFiO0FBQ0EsTUFBSSxNQUFNLE9BQU8sSUFBUCxDQUFWO0FBQ0EsWUFBVSxVQUFWLEdBQXVCLFlBQVk7QUFDbEMsVUFBTyxJQUFQLElBQWUsR0FBZjtBQUNBLFVBQU8sU0FBUDtBQUNBLEdBSEQ7QUFJQSxTQUFPLElBQVAsSUFBZSxTQUFmO0FBQ0E7QUFDRCxDQWZELEVBZUcsbUJBZkgsRUFld0IsWUFBWTtBQUNuQyxRQUFPLGVBQVA7QUFDQSxDQWpCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcG9wdWxhdGVDaGFyID0gZnVuY3Rpb24oY2gsIGFtb3VudCl7XG5cdHZhciByZXN1bHQgPSBcIlwiO1xuXHRmb3IodmFyIGk9MDsgaTxhbW91bnQ7IGkgKz0gMSl7XG5cdFx0cmVzdWx0ICs9IGNoO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5mdW5jdGlvbiBodG1sVG9QbGFpblRleHQoaHRtbFRleHQsIHN0eWxlQ29uZmlnKSB7XG5cblx0Ly8gZGVmaW5lIGRlZmF1bHQgc3R5bGVDb25maWdcblx0dmFyIGxpbmtQcm9jZXNzID0gbnVsbDtcblx0dmFyIGltZ1Byb2Nlc3MgPSBudWxsO1xuXHR2YXIgaGVhZGluZ1N0eWxlID0gXCJ1bmRlcmxpbmVcIjsgLy8gaGFzaGlmeSwgYnJlYWtsaW5lXG5cdHZhciBsaXN0U3R5bGUgPSBcImluZGVudGlvblwiOyAvLyBpbmRlbnRpb24sIGxpbmVicmVha1xuXHR2YXIgdUluZGVudGlvbkNoYXIgPSBcIi1cIjtcblx0dmFyIGxpc3RJbmRlbnRpb25UYWJzID0gMztcblx0dmFyIG9JbmRlbnRpb25DaGFyID0gXCItXCI7XG5cblx0Ly8gb3IgYWNjZXB0IHVzZXIgZGVmaW5lZCBjb25maWdcblx0aWYoISFzdHlsZUNvbmZpZyl7XG5cdFx0aWYodHlwZW9mIHN0eWxlQ29uZmlnLmxpbmtQcm9jZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGxpbmtQcm9jZXNzID0gc3R5bGVDb25maWcubGlua1Byb2Nlc3M7XG5cdFx0fVxuXHRcdGlmKHR5cGVvZiBzdHlsZUNvbmZpZy5pbWdQcm9jZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGltZ1Byb2Nlc3MgPSBzdHlsZUNvbmZpZy5pbWdQcm9jZXNzO1xuXHRcdH1cblx0XHRpZighIXN0eWxlQ29uZmlnLmhlYWRpbmdTdHlsZSkge1xuXHRcdFx0aGVhZGluZ1N0eWxlID0gc3R5bGVDb25maWcuaGVhZGluZ1N0eWxlO1xuXHRcdH1cblx0XHRpZighIXN0eWxlQ29uZmlnLmxpc3RTdHlsZSkge1xuXHRcdFx0bGlzdFN0eWxlID0gc3R5bGVDb25maWcubGlzdFN0eWxlO1xuXHRcdH1cblx0XHRpZighIXN0eWxlQ29uZmlnLnVJbmRlbnRpb25DaGFyKSB7XG5cdFx0XHR1SW5kZW50aW9uQ2hhciA9IHN0eWxlQ29uZmlnLnVJbmRlbnRpb25DaGFyO1xuXHRcdH1cblx0XHRpZighIXN0eWxlQ29uZmlnLmxpc3RJbmRlbnRpb25UYWJzKSB7XG5cdFx0XHRsaXN0SW5kZW50aW9uVGFicyA9IHN0eWxlQ29uZmlnLmxpc3RJbmRlbnRpb25UYWJzO1xuXHRcdH1cblx0XHRpZighIXN0eWxlQ29uZmlnLm9JbmRlbnRpb25DaGFyKSB7XG5cdFx0XHRvSW5kZW50aW9uQ2hhciA9IHN0eWxlQ29uZmlnLm9JbmRlbnRpb25DaGFyO1xuXHRcdH1cblx0fVxuXG5cdHZhciB1SW5kZW50aW9uID0gcG9wdWxhdGVDaGFyKHVJbmRlbnRpb25DaGFyLCBsaXN0SW5kZW50aW9uVGFicyk7XG5cblx0Ly8gcmVtb3ZlbCBhbGwgXFxuIGxpbmVicmVha3Ncblx0dmFyIHRtcCA9IFN0cmluZyhodG1sVGV4dCkucmVwbGFjZSgvXFxufFxcci9nLCBcIiBcIik7XG5cblx0Ly8gcmVtb3ZlIGV2ZXJ5dGhpbmcgYmVmb3JlIGFuZCBhZnRlciA8Ym9keT4gdGFncyBpbmNsdWRpbmcgdGhlIHRhZyBpdHNlbGZcblx0dG1wID0gdG1wLnJlcGxhY2UoLzxcXC9ib2R5Pi4qL2ksIFwiXCIpO1xuXHR0bXAgPSB0bXAucmVwbGFjZSgvLio8Ym9keVtePl0qPi9pLCBcIlwiKTtcblxuXHQvLyByZW1vdmUgaW5ib2R5IHNjcmlwdHMgYW5kIHN0eWxlc1xuXHR0bXAgPSB0bXAucmVwbGFjZSgvPChzY3JpcHR8c3R5bGUpKCBbXj5dKikqPigoPyE8XFwvXFwxKCBbXj5dKikqPikuKSo8XFwvXFwxPi9naSwgXCJcIik7XG5cblx0Ly8gcmVtb3ZlIGFsbCB0YWdzIGV4Y2VwdCB0aGF0IGFyZSBiZWluZyBoYW5kbGVkIHNlcGFyYXRlbHlcblx0dG1wID0gdG1wLnJlcGxhY2UoLzwoXFwvKT8oKD8haFsxLTZdKCBbXj5dKikqPikoPyFpbWcoIFtePl0qKSo+KSg/IWEoIFtePl0qKSo+KSg/IXVsKCBbXj5dKikqPikoPyFvbCggW14+XSopKj4pKD8hbGkoIFtePl0qKSo+KSg/IXAoIFtePl0qKSo+KSg/IWRpdiggW14+XSopKj4pKD8hdGQoIFtePl0qKSo+KSg/IWJyKCBbXj5dKikqPilbXj5cXC9dKVtePl0qPi9naSwgXCJcIik7XG5cblx0Ly8gcmVtb3ZlIG9yIHJlcGxhY2UgaW1hZ2VzIC0gcmVwbGFjZW1lbnQgdGV4dHMgd2l0aCA8PiB0YWdzIHdpbGwgYmUgcmVtb3ZlZCBhbHNvLCBpZiBub3QgaW50ZW50aW9uYWwsIHRyeSB0byB1c2Ugb3RoZXIgbm90YXRpb25cblx0dG1wID0gdG1wLnJlcGxhY2UoLzxpbWcoW14+XSopPi9naSwgZnVuY3Rpb24oc3RyLCBpbUF0dHJzKSB7XG5cdFx0dmFyIGltU3JjID0gXCJcIjtcblx0XHR2YXIgaW1BbHQgPSBcIlwiO1xuXHRcdHZhciBpbVNyY1Jlc3VsdCA9ICgvc3JjPVwiKFteXCJdKilcIi9pKS5leGVjKGltQXR0cnMpO1xuXHRcdHZhciBpbUFsdFJlc3VsdCA9ICgvYWx0PVwiKFteXCJdKilcIi9pKS5leGVjKGltQXR0cnMpO1xuXHRcdGlmKGltU3JjUmVzdWx0ICE9PSBudWxsKXtcblx0XHRcdGltU3JjID0gaW1TcmNSZXN1bHRbMV07XG5cdFx0fVxuXHRcdGlmKGltQWx0UmVzdWx0ICE9PSBudWxsKXtcblx0XHRcdGltQWx0ID0gaW1BbHRSZXN1bHRbMV07XG5cdFx0fVxuXHRcdGlmKHR5cGVvZihpbWdQcm9jZXNzKSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gaW1nUHJvY2VzcyhpbVNyYywgaW1BbHQpO1xuXHRcdH1cblx0XHRpZihpbUFsdCA9PT0gXCJcIil7XG5cdFx0XHRyZXR1cm4gXCIhW2ltYWdlXSAoXCIrIGltU3JjICsgXCIpXCI7XG5cdFx0fVxuXHRcdHJldHVybiBcIiFbXCIgKyBpbUFsdCtcIl0gKFwiKyBpbVNyYyArIFwiKVwiO1xuXHR9KTtcblxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUxpc3RSZXBsYWNlQ2IoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1hdGNoLCBsaXN0VHlwZSwgbGlzdEF0dHJpYnV0ZXMsIGxpc3RCb2R5KSB7XG5cdFx0XHR2YXIgbGlJbmRleCA9IDA7XG5cdFx0XHRpZihsaXN0QXR0cmlidXRlcyAmJiAvc3RhcnQ9XCIoWzAtOV0rKVwiL2kudGVzdChsaXN0QXR0cmlidXRlcykpIHtcblx0XHRcdFx0bGlJbmRleCA9ICgvc3RhcnQ9XCIoWzAtOV0rKVwiL2kuZXhlYyhsaXN0QXR0cmlidXRlcylbMV0pLTE7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGxhaW5MaXN0SXRlbSA9IFwiPHA+XCIgKyBsaXN0Qm9keS5yZXBsYWNlKC88bGlbXj5dKj4oKCg/ITxsaVtePl0qPikoPyE8XFwvbGk+KS4pKik8XFwvbGk+L2dpLCBmdW5jdGlvbihzdHIsIGxpc3RJdGVtKSB7XG5cdFx0XHRcdHZhciBhY3RTdWJJbmRleCA9IDA7XG5cdFx0XHRcdHZhciBwbGFpbkxpc3RMaW5lID0gbGlzdEl0ZW0ucmVwbGFjZSgvKF58KDxiciBcXC8+KSkoPyE8cD4pL2dpLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmKGxpc3RUeXBlID09PSBcIm9cIiAmJiBhY3RTdWJJbmRleCA9PT0gMCl7XG5cdFx0XHRcdFx0XHRsaUluZGV4ICs9IDE7XG5cdFx0XHRcdFx0XHRhY3RTdWJJbmRleCArPSAxO1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiPGJyIC8+XCIgKyBsaUluZGV4ICsgcG9wdWxhdGVDaGFyKG9JbmRlbnRpb25DaGFyLCBsaXN0SW5kZW50aW9uVGFicy0oU3RyaW5nKGxpSW5kZXgpLmxlbmd0aCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gXCI8YnIgLz5cIiArIHVJbmRlbnRpb247XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gcGxhaW5MaXN0TGluZTtcblx0XHRcdH0pK1wiPC9wPlwiO1xuXHRcdFx0cmV0dXJuIHBsYWluTGlzdEl0ZW07XG5cdFx0fTtcblx0fVxuXG5cdC8vIGhhbmRsZSBsaXN0c1xuXHRpZihsaXN0U3R5bGUgPT09IFwibGluZWJyZWFrXCIpe1xuXHRcdHRtcCA9IHRtcC5yZXBsYWNlKC88XFwvP3VsW14+XSo+fDxcXC8/b2xbXj5dKj58PFxcLz9saVtePl0qPi9naSwgXCJcXG5cIik7XG5cdH1cblx0ZWxzZSBpZihsaXN0U3R5bGUgPT09IFwiaW5kZW50aW9uXCIpe1xuXHRcdHdoaWxlKCAvPChvfHUpbFtePl0qPiguKik8XFwvXFwxbD4vZ2kudGVzdCh0bXApKXtcblx0XHRcdHRtcCA9IHRtcC5yZXBsYWNlKC88KG98dSlsKFtePl0qKT4oKCg/ITwob3x1KWxbXj5dKj4pKD8hPFxcLyhvfHUpbD4pLikqKTxcXC9cXDFsPi9naSwgY3JlYXRlTGlzdFJlcGxhY2VDYigpKTtcblx0XHR9XG5cdH1cblxuXHQvLyBoYW5kbGUgaGVhZGluZ3Ncblx0aWYoaGVhZGluZ1N0eWxlID09PSBcImxpbmVicmVha1wiKSB7XG5cdFx0dG1wID0gdG1wLnJlcGxhY2UoLzxoKFsxLTZdKVtePl0qPihbXjxdKik8XFwvaFxcMT4vZ2ksIFwiXFxuJDJcXG5cIik7XG5cdH1cblx0ZWxzZSBpZihoZWFkaW5nU3R5bGUgPT09IFwidW5kZXJsaW5lXCIpIHtcblx0XHR0bXAgPSB0bXAucmVwbGFjZSgvPGgxW14+XSo+KCgoPyE8XFwvaDE+KS4pKik8XFwvaDE+L2dpLCBmdW5jdGlvbihzdHIsIHAxKSB7XG5cdFx0XHRyZXR1cm4gXCJcXG4mbmJzcDtcXG5cIiArIHAxICsgXCJcXG5cIiArIHBvcHVsYXRlQ2hhcihcIj1cIiwgcDEubGVuZ3RoKSArIFwiXFxuJm5ic3A7XFxuXCI7XG5cdFx0fSk7XG5cdFx0dG1wID0gdG1wLnJlcGxhY2UoLzxoMltePl0qPigoKD8hPFxcL2gyPikuKSopPFxcL2gyPi9naSwgZnVuY3Rpb24oc3RyLCBwMSkge1xuXHRcdFx0cmV0dXJuIFwiXFxuJm5ic3A7XFxuXCIgKyBwMSArIFwiXFxuXCIgKyBwb3B1bGF0ZUNoYXIoXCItXCIsIHAxLmxlbmd0aCkgKyBcIlxcbiZuYnNwO1xcblwiO1xuXHRcdH0pO1xuXHRcdHRtcCA9IHRtcC5yZXBsYWNlKC88aChbMy02XSlbXj5dKj4oKCg/ITxcXC9oXFwxPikuKSopPFxcL2hcXDE+L2dpLCBmdW5jdGlvbihzdHIsIHAxLCBwMikge1xuXHRcdFx0cmV0dXJuIFwiXFxuJm5ic3A7XFxuXCIgKyBwMiArIFwiXFxuJm5ic3A7XFxuXCI7XG5cdFx0fSk7XG5cdH1cblx0ZWxzZSBpZihoZWFkaW5nU3R5bGUgPT09IFwiaGFzaGlmeVwiKSB7XG5cdFx0dG1wID0gdG1wLnJlcGxhY2UoLzxoKFsxLTZdKVtePl0qPihbXjxdKik8XFwvaFxcMT4vZ2ksIGZ1bmN0aW9uKHN0ciwgcDEsIHAyKSB7XG5cdFx0XHRyZXR1cm4gXCJcXG4mbmJzcDtcXG5cIiArIHBvcHVsYXRlQ2hhcihcIiNcIiwgcDEpICsgXCIgXCIgKyBwMiArIFwiXFxuJm5ic3A7XFxuXCI7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyByZXBsYWNlIDxicj5zLCA8dGQ+cywgPGRpdnM+IGFuZCA8cD5zIHdpdGggbGluZWJyZWFrc1xuXHR0bXAgPSB0bXAucmVwbGFjZSgvPGJyKCBbXj5dKikqPnw8cCggW14+XSopKj58PFxcL3AoIFtePl0qKSo+fDxkaXYoIFtePl0qKSo+fDxcXC9kaXYoIFtePl0qKSo+fDx0ZCggW14+XSopKj58PFxcL3RkKCBbXj5dKikqPi9naSwgXCJcXG5cIik7XG5cblx0Ly8gcmVwbGFjZSA8YSBocmVmPmI8YT4gbGlua3Mgd2l0aCBiIChocmVmKSBvciBhcyBkZXNjcmliZWQgaW4gdGhlIGxpbmtQcm9jZXNzIGZ1bmN0aW9uXG5cdHRtcCA9IHRtcC5yZXBsYWNlKC88YVtePl0qaHJlZj1cIihbXlwiXSopXCJbXj5dKj4oW148XSspPFxcL2FbXj5dKj4vZ2ksIGZ1bmN0aW9uKHN0ciwgaHJlZiwgbGlua1RleHQpIHtcblx0XHRpZih0eXBlb2YgbGlua1Byb2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIGxpbmtQcm9jZXNzKGhyZWYsIGxpbmtUZXh0KTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiIFtcIiArIGxpbmtUZXh0K1wiXSAoXCIrIGhyZWYgKyBcIikgXCI7XG5cdH0pO1xuXG5cdC8vIHJlbW92ZSB3aGl0ZXNwYWNlIGZyb20gZW1wdHkgbGluZXMgZXhjbHVkaW5nIG5ic3Bcblx0dG1wID0gdG1wLnJlcGxhY2UoL1xcblsgXFx0XFxmXSovZ2ksIFwiXFxuXCIpO1xuXG5cdC8vIHJlbW92ZSBkdXBsaWNhdGVkIGVtcHR5IGxpbmVzXG5cdHRtcCA9IHRtcC5yZXBsYWNlKC9cXG5cXG4rL2dpLCBcIlxcblwiKTtcblxuXHQvLyByZW1vdmUgZHVwbGljYXRlZCBzcGFjZXMgaW5jbHVkaW5nIG5vbiBicmFraW5nIHNwYWNlc1xuXHR0bXAgPSB0bXAucmVwbGFjZSgvKCB8Jm5ic3A7fFxcdCkrL2dpLCBcIiBcIik7XG5cblx0Ly8gcmVtb3ZlIGxpbmUgc3RhcnRlciBzcGFjZXNcblx0dG1wID0gdG1wLnJlcGxhY2UoL1xcbiArL2dpLCBcIlxcblwiKTtcblxuXHQvLyByZW1vdmUgY29udGVudCBzdGFydGVyIHNwYWNlc1xuXHR0bXAgPSB0bXAucmVwbGFjZSgvXiArL2dpLCBcIlwiKTtcblxuXHQvLyByZW1vdmUgZmlyc3QgZW1wdHkgbGluZVxuXHR3aGlsZSh0bXAuaW5kZXhPZihcIlxcblwiKSA9PT0gMCl7XG5cdFx0dG1wID0gdG1wLnN1YnN0cmluZygxKTtcblx0fVxuXG5cdC8vIHB1dCBhIG5ldyBsaW5lIGF0IHRoZSBlbmRcblx0aWYodG1wLmxlbmd0aCA9PT0gMCB8fCB0bXAubGFzdEluZGV4T2YoXCJcXG5cIikgIT09IHRtcC5sZW5ndGgtMSl7XG5cdFx0dG1wICs9IFwiXFxuXCI7XG5cdH1cblxuXHRyZXR1cm4gdG1wO1xufVxuXG5cbihmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbil7XG5cdGlmICh0aGlzICYmIHR5cGVvZiB0aGlzLmRlZmluZSA9PT0gXCJmdW5jdGlvblwiKXsgLy8gQU1EXG5cdFx0dGhpcy5kZWZpbmUoZGVmaW5pdGlvbik7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykgeyAvLyBOb2RlLmpzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG5cdH0gZWxzZSB7IC8vIEJyb3dzZXJcblx0XHR2YXIgdGhlTW9kdWxlID0gZGVmaW5pdGlvbigpO1xuXHRcdHZhciBnbG9iYWwgPSB0aGlzO1xuXHRcdHZhciBvbGQgPSBnbG9iYWxbbmFtZV07XG5cdFx0dGhlTW9kdWxlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxbbmFtZV0gPSBvbGQ7XG5cdFx0XHRyZXR1cm4gdGhlTW9kdWxlO1xuXHRcdH07XG5cdFx0Z2xvYmFsW25hbWVdID0gdGhlTW9kdWxlO1xuXHR9XG59KShcImNyZWF0ZVRleHRWZXJzaW9uXCIsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIGh0bWxUb1BsYWluVGV4dDtcbn0pO1xuIl19
