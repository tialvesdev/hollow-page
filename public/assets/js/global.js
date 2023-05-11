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
};