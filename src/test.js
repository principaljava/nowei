function colorsToString(colors) {
    var colorsCountString = colors.length === 1
                            ? " colour " : " colours ";

    var colorsCount = colors.length;

    var colorsString = colors.length === 1
                        ? colors[0]
                        : colors.splice(0, colors.length - 1).join(', ') +
                            " and " + colors[colors.length - 1];
                            
    return colorsCount + colorsCountString + ": " + colorsString;
}

console.log(
    colorsToString([
        'red',
        'green',
        'blue',
        'white'
    ])
);