var dadosAlerta = [];

function changeLogin(previousSection, nextSection) {
    console.log(document.getElementById(previousSection))
    document.getElementById(previousSection).style.display = 'none';
    document.getElementById(nextSection).style.display = 'flex';
}

function validarEmail(email) {
    if (email == "" || email == undefined) {
        dadosAlerta = [
            'error',
            'Email inválido',
            'Digite um email...'
        ];
    } else if (!email.includes('@')) {
        dadosAlerta = [
            'error',
            'Email inválido',
            'Digite um email que contenha @...'
        ];
    } else if (email.substring(email.indexOf('@') + 1) == "") {
        dadosAlerta = [
            'error',
            'Email inválido',
            'Digite um email que contenha um provedor após o @...'
        ];
    } else {
        return true;
    }

    console.log('Email: ' + email);

    return false;
}

function validarSenha(senha) {
    if (senha == "" || senha == undefined) {
        dadosAlerta = [
            'error',
            'Senha inválida',
            'Digite uma senha...'
        ];
    } else if (senha.length < 5) {
        dadosAlerta = [
            'error',
            'Senha inválida',
            'Digite uma senha com no mínimo 5 caracteres...'
        ];
    } else {
        return true;
    }

    console.log('Senha: ' + senha);

    return false;
}

function validarTexto(nome, texto, tamanho) {
    if(texto == "" || texto == undefined) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome}...`
        ];
    } else if(texto.length > tamanho) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome} até ${tamanho} caracteres...`
        ];
    } else {
        return true;
    }

    console.log(`${nome}: ${texto}`);
    return false;
}