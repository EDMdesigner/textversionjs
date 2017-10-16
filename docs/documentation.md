---
layout: default
title: Documentation
permalink: /documentation/
---

# BulletproofLineLenght

A universal tool to break long rows in a html file without causing any change in the output view.

INSTALLATION

```js
npm install bulletproofLineLength
```

USAGE:

```js
var bulletproofLineLength = require("bulletproofLineLength");

var stringWithShortLines = 
bulletproofLineLength(stringWithLongLines, maximalLineLength);
```
**stringWithLongLines** is the input string;

**maximalLineLength** is the line length limit;

**returns stringWithShortLines** containing the same text as in stringWithLongLines, but with long lines broken.
