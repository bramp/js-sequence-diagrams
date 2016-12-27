test('Render', function() {
    // Try and render, but don't actually check the rendered output
    var themes = _.omit(Diagram.themes, ['hand', 'simple']);

    var diagram = Diagram.parse("A->B: Blah");
    _.each(themes, function(value, theme) {
        var container = document.createElement("div");
        // TODO Fix Math.seedrandom(''); // Seed so we can fix the drawing of the diagram on multiple iterations
        diagram.drawSVG(container, {
            theme: theme
        });
    });
});
