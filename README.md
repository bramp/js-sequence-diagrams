Generates sequence diagrams from a simple text language
=======================================================

by [Andrew Brampton](http://bramp.net) 2012

<https://github.com/bramp/handy-tools>
<https://github.com/bramp/handy-tools>

Example
-------

  Alice->Bob: Hello Bob, how are you?
  Note right of Alice: Bob thinks
  Bob->Alice: I am good thanks!

![Alt text](/path/to/img.jpg "Optional title")

Requirements
------------
	You need underscore and raphael

Usage
-----

On your page you need to include both underscore and raphael like so:

  <script src="underscore-min.js"></script>
  <script src="raphael-min.js"></script>

and then 
  <script src="sequence-diagram.js"></script>

  var diagram = Diagram.parse($('#language').val());
  diagram.drawSVG('diagram');


Build requirements
------------------
	JavaScript Preprocessor
		gem install jspp

TODO
----
Write jquery plugin
Change Makefile to Grunt (because it looks cool)
Other themes


Licence (Simplified BSD License)
-------

Copyright (c) 2012, Andrew Brampton 
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.