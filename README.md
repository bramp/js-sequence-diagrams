JS Sequence Diagrams
=============================================
**Generates UML sequence diagrams from simple text**  
<http://bramp.github.io/js-sequence-diagrams/>

by [Andrew Brampton](http://bramp.net) 2012-2015


Example
-------
We turn

    Alice->Bob: Hello Bob, how are you?
    Note right of Bob: Bob thinks
    Bob-->Alice: I am good thanks!

into

![Sample generated UML diagram](http://bramp.github.io/js-sequence-diagrams/images/sample.svg)

Requirements
------------
You will need [Raphaël](http://raphaeljs.com/), [underscore.js](http://underscorejs.org/) (or [lodash](https://lodash.com/)), and optionally [jQuery](https://jquery.com/).


Installation
----------------------

### bower

Just run `bower install bramp/js-sequence-diagrams` and include the scripts below:

```html
<script src="{{ bower directory }}/raphael/raphael-min.js"></script>
<script src="{{ bower directory }}/underscore/underscore-min.js"></script>
<script src="{{ bower directory }}/js-sequence-diagrams/build/sequence-diagram-min.js"></script>
```

### Manually

You can download the dependencies (see requirements above) and include them on your page like so:

```html
<script src="underscore-min.js"></script>
<script src="raphael-min.js"></script>
<script src="sequence-diagram-min.js"></script>
```

Usage
-----

You can use the Diagram class like:

```html
<div id="diagram">Diagram will be placed here</div>
<script> 
  var diagram = Diagram.parse("A->B: Does something");
  diagram.drawSVG('diagram');
</script>
```

or use jQuery to do all the work:
```html
<div class="diagram">A->B: Message</div>
<script>
$(".diagram").sequenceDiagram({theme: 'hand'});
</script>
```

Build requirements
------------------
```bash
# JavaScript Preprocessor 
sudo gem install jspp

## Then to build, just run:
make

## The Makefile will use npm to install all the correct dev dependencies
```

How to release
--------------
* Make sure all changes checked in
* Bump version in src/main.js
* ``make clean``
* ``make``
* ``git add -f src/main.js build/sequence-diagram-min.js build/sequence-diagram-min.js.map``
* ``git commit -m "Released version 1.x.x"``
* ``git push origin master``
* ``git tag -a v1.x.x -m v1.x.x``
* ``git push origin v1.x.x``

TODO
----
* Other themes
* Rethink the use of Raphael. Due to its support of VML (which I don't care about), it makes many things harder. For example, font support, css styling, etc. Perhaps draw the SVG by hand, or find a small helper library
* Dozens of other issues on https://github.com/bramp/js-sequence-diagrams/issues

Contributors
------------

via [GitHub](https://github.com/bramp/js-sequence-diagrams/graphs/contributors)

Thanks
------
This project makes use of [Jison](http://zaach.github.io/jison/), Raphaël, underscore.js, and the awersome [Daniel font](http://www.dafont.com/daniel.font) (which is free to use for any purpose).

Many thanks to [Web Sequence Diagrams](http://www.websequencediagrams.com/) which greatly inspired this project, and forms the basis for the syntax.

Related
-------

* [Web Sequence Diagrams](http://www.websequencediagrams.com/) Server side version with a commerical offering
* [flowchart.js](http://adrai.github.io/flowchart.js/) A similar project that draws flow charts in the browser

Licence (Simplified BSD License)
-------

Copyright (c) 2012-2013, Andrew Brampton  
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
