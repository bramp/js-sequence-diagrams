This directory contains the "Daniel" hand drawn font.
[Website](http://goodreasonblog.blogspot.com/p/fontery.html)

It contains fonts in otf format. 
  daniel   - Regular
  danielbk - Black
  danielbd - Bold

The daniel bold font had a couple of mistakes
	The backslash '\' character was drawn as a forward slash '/'.
	The µ, π, Ω, ∂, ∏ and ∑ characters mapped to unrelated characters.

I (bramp) fixed the backslash issues by just flipping the character. This was saved in the danielbd-fix.otf. The OTF fonts were then converted to cufon format, using [this site](http://cufon.shoqolate.com/generate/). In the created file I removed the few characters with invalid glyphs.

Check out the font_test.html, to see all valid glyths.