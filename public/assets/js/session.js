function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    if (email == null && nome == null) {
        window.location = "../login.html";
    }
    
}

function limparSessao() {
    
    sessionStorage.removeItem('ID_USUARIO',);
    sessionStorage.removeItem('EMAIL_USUARIO');
    sessionStorage.removeItem('NOME_USUARIO');
    
    window.location = "../login.html";
}
