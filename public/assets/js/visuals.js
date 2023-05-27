

function changeSectionSmooth(wrapperDiv, previousSection, nextSection) {
    var wrapper = document.getElementById(wrapperDiv);
    var prevSect = document.getElementById(previousSection);
    var nextSect = document.getElementById(nextSection);

    wrapper.classList.toggle('oculto');
    
    setTimeout(() => prevSect.style.display = 'none', 401);
    setTimeout(() => nextSect.style.display = 'flex', 415);
    
    setTimeout(() => wrapper.classList.toggle('amostra'), 430);

    // wrapper.classList.toggle('oculto');

    // setTimeout(() => prevSect.style.display = 'none', 401);
    
    // prevSect.style.display = 'none'
    // nextSect.style.display = 'flex'
}
