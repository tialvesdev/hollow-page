function changeSection(previousSection, nextSection) {
    console.log(document.getElementById(previousSection));
    
    document.getElementById(previousSection).style.opacity = '0';
    document.getElementById(previousSection).style.width = '0';
    document.getElementById(previousSection).style.height = '0';
    document.getElementById(previousSection).style.minHeight = '0';
    document.getElementById(previousSection).style.minWidth = '0';
    document.getElementById(previousSection).style.padding = '0';
    
    document.getElementById(nextSection).style.opacity = '1';
    document.getElementById(nextSection).style.width = '100%';
    document.getElementById(nextSection).style.height = 'auto';
    document.getElementById(nextSection).style.minHeight = '100vh';
    document.getElementById(nextSection).style.padding = '75px';
}

function changeSectionSmooth(wrapperDiv, otherSection1, otherSection2, nextSection) {
    var wrapper = document.getElementById(wrapperDiv);
    var other1 = document.getElementById(otherSection1);
    var other2 = document.getElementById(otherSection2);
    var nextSect = document.getElementById(nextSection);

    wrapper.classList.toggle('oculto');
    
    setTimeout(() => other1.style.display = 'none', 401);
    setTimeout(() => other2.style.display = 'none', 402);
    setTimeout(() => nextSect.style.display = 'flex', 415);
    
    setTimeout(() => wrapper.classList.toggle('amostra'), 430);
}

function colorText (noColor1, noColor2, color) {
    var colorEl = document.getElementById(color);
    var noColor1El = document.getElementById(noColor1);
    var noColor2El = document.getElementById(noColor2);

    noColor1El.style.color = '#FFFFFF';
    noColor2El.style.color = '#FFFFFF';
    colorEl.style.color = '#69E2EE';
}

function setHidden(id) {
    document.getElementById(id).classList.add('hidden');
}

function addBlur (element) {
    var navbar = document.getElementById(element);
    if (window.scrollY > 0) {
        navbar.classList.add('blur');
    } else {
        navbar.classList.remove('blur');
    }
}

var doneCards = [
    false,
    false,
    false,
    false,
]

function cardsAnimation(img1, img2, c) {
    img1.style.transition = 'all .4s ease-in-out'

    img1.style.transform = 'translate(-300px, -300px) rotate(-15deg)';

    setTimeout(() => {
        if (doneCards[c] == false || img1.style.zIndex == 1) {
            img1.style.zIndex = 0;
            img2.style.zIndex = 1;
            doneCards[c] = true
        } else {
            img1.style.zIndex = 1;
            img2.style.zIndex = 0;
        }
        setTimeout(img1.style.transform = '', 500);

    }, 400);

}

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