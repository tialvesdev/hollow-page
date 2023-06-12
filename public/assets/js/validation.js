var dadosAlerta = [];

function stringToNull(string) {
    if (string == '' || string == undefined) {
        return ''
    } else {
        return `'${string}'`
    }
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
            `Digite um(a) ${nome} de até ${tamanho} caracteres...`
        ];
    } else {
        console.log(nome + 'certo');
        return true;
    }

    console.log(`${nome}: ${texto}`);
    return false;
}

function validarTelefone(nome, texto, tamanho) {
    console.log(typeof texto, texto == null);
    if (texto == '') {
        return true
    } else if(texto == undefined) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome}...`
        ];
    } else if(texto.length - 2 != tamanho) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome} com exatos ${tamanho} caracteres...`
        ];
    } else {
        console.log(nome + ' estrito certo');
        return true;
    }

    console.log(texto.length, tamanho);

    console.log(`${nome}: ${texto}`);
    return false;
}

function validarData (nome, data) {
    var dataFormatada = new Date(data);
    var dataAtual = new Date();

    if(data == "" || data == undefined) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome}...`
        ];
        console.log('if');
    } else if(dataFormatada.getFullYear() <= 1900 || dataFormatada.getFullYear() >= dataAtual.getFullYear()) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome} válida ...`
        ];
        console.log('else if');

    } else {
        console.log('else, data certa');

        return true;
    }
    console.log('acabou');

    return false;
}

function validarIguais (valor1, valor2) {
    if (valor1 =! valor2) {
        dadosAlerta = [
            'error',
            `${valor1} e/ou ${valor2} inválidos`,
            `${valor1} e ${valor2} não coincidem...`
        ];
    }else {
        return true;
    }
    return false;
}