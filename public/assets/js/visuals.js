function changeSection(previousSection, nextSection) {
    console.log(document.getElementById(previousSection))
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
