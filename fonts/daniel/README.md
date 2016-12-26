This directory contains the "Daniel" hand drawn font.
[Website](http://goodreasonblog.blogspot.com/p/fontery.html)

It contains fonts in ttf format. 
	daniel.ttf   - Regular
	danielbk.ttf - Black
	danielbd.ttf - Bold

The daniel bold font had a couple of mistakes
	The backslash '\' character was drawn as a forward slash '/'.
	The µ, π, Ω, ∂, ∏ and ∑ characters mapped to unrelated characters.
	The , ﬁ, ﬂ were incorrectly mapped to 0xff00 though 0xff03.

I (bramp) fixed the backslash issues by just flipping the character, and removed the other invalid mappings. This original font was saved as danielbd-original.ttf.

Check out the test/font_test.html, to see all valid glyths.

## Raphael
For Raphael the TTF fonts were then converted to cufon format, using [this site](http://cufon.shoqolate.com/generate/).

## Snap.svg
Snap uses normal CSS styled fonts. In this case, I used [font squirell](http://www.fontsquirrel.com/tools/webfont-generator) to convert to daniel OTF fonts to WOFF/WOFF2 formats, which is supported across modern browsers.

