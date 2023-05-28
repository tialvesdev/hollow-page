var dadosAlerta = [];

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

    // console.log(`${nome}: ${texto}`);
    return false;
}

function validarData (nome, data, anoMaisAntigo) {
    var dataFormatada = new Date(data);
    var dataAtual = new Date();

    if(data == "" || data == undefined) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome}...`
        ];
    } else if(dataFormatada.getFullYear() <= 1900 || dataFormatada.getFullYear() >= dataAtual.getFullYear()) {
        dadosAlerta = [
            'error',
            `${nome} inválido(a)`,
            `Digite um(a) ${nome} válida ...`
        ];
    } else {
        return true;
    }

    // console.log(`${nome}: ${texto}`);
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

    // console.log(`${valor1}: ${valor2}`);
    return false;
}