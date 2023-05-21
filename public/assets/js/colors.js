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

        document.querySelectorAll('.dream-efx-img').forEach((element) => {
            var randomColor = colors[Math.floor(Math.random() * colors.length)];

            element.style.filter = `invert(97%) sepia(97%) saturate(4%) hue-rotate(77deg) brightness(104%) contrast(100%) 
            drop-shadow(0 0 5px ${randomColor}) drop-shadow(0 0 10px ${randomColor}) drop-shadow(0 0 15px ${randomColor}) blur(${Math.floor(Math.random() * 10)}px)`;
        });

        selectedColor = '';
    } else {
        elements.forEach(element => element.style.color = colors[color]);

        document.querySelectorAll('.dream-efx-img').forEach((element) => {
            
            element.style.filter = `invert(97%) sepia(97%) saturate(4%) hue-rotate(77deg) brightness(104%) contrast(100%) 
            drop-shadow(0 0 5px ${colors[color]}) drop-shadow(0 0 10px ${colors[color]}) drop-shadow(0 0 15px ${colors[color]}) blur(${Math.floor(Math.random() * 10)}px)`;
        });

        selectedColor = colors[color];
        sessionStorage.selectedColor = selectedColor;
    }
}