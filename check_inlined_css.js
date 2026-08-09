const fs = require('fs');
const html = fs.readFileSync("C:/My Web Sites/skesh link/www.geniusactglobal.com/index.html", 'utf8');

const startTag = "<style>/* Inlined site35a7.css */";
const endTag = "</style>";

const startIdx = html.indexOf(startTag);
const cssStart = startIdx + startTag.length;
const endIdx = html.indexOf(endTag, cssStart);

const css = html.substring(cssStart, endIdx);
console.log("Inlined context from 25000 to 25400:\n", css.substring(25000, 25400));
