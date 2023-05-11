var colors = [
    '',
    '#6D1930',
    '#EF6069',
    '#E9AFE9',
    '#BF78CE',
    '#69E2EE',
    '#DDC890'
];

var selectedColor = '';

function trocaCorTema(color) {
    var elements = document.querySelectorAll(
        '.grimm1, .grimm2, .crystal, .dreams, .lifeblood, .godmaster'
    );

    if (color == 0) {
        elements.forEach(element => element.style.removeProperty('color'));

        selectedColor = '';
    } else {
        elements.forEach(element => element.style.color = colors[color]);

        selectedColor = colors[color];
    }
}